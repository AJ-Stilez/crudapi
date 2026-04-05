import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CrudService } from './core/crud.service';
import { RefreshTokenSchemaClass } from 'src/schema/class/refresh-token.schema.class';
import type {
  RefreshToken,
  RefreshTokenDocument,
} from 'src/schema/class/refresh-token.schema.class';
import { InjectModel } from '@nestjs/mongoose';
import { MAX_REFRESH_ATTEMPTS_PER_DAY, MAX_SESSION_LIFETIME_HOURS, REFRESH_TOKEN_EXPIRATION_HOURS, REFRESH_TOKEN_INACTIVITY_HOURS } from 'src/constants/security.constant';
import { Logger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import {
  decryptRefreshToken,
  encryptRefreshToken,
} from 'src/utils/refresh-token-encryption.utils';
import { Model } from 'mongoose';
import { handleAndThrowError } from 'src/utils/error.utils';
import { AuditTrailProcessType } from 'src/schema/class/audit-trail.schema.class';
import { AuditAction } from 'src/enums/audit-actions.enums';
import { AuditTrailService } from './audit-trail.service';

@Injectable()
export class RefreshTokenService extends CrudService<RefreshTokenDocument> {
  constructor(
    @InjectModel('RefreshToken')
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly logger: Logger,
    private readonly auditTrailService: AuditTrailService,
  ) {
    super(refreshTokenModel);
  }

  async createRefreshToken(
    userId: string,
    authId: string,
    deviceInfo?: {
      deviceId?: string;
      userAgent?: string;
      ipAddress?: string;
    },
    firstIssuedAt?: Date, // For token rotation - preserve original issue date)
  ): Promise<string> {
    const tokenId = uuidv4();
    const now = dayjs();
    const issuedAt = firstIssuedAt ? dayjs(firstIssuedAt) : now;
    await this.create({
      tokenId,
      userId,
      authId,
      deviceId: deviceInfo?.deviceId,
      userAgent: deviceInfo?.userAgent,
      ipAddress: deviceInfo?.ipAddress,
      expiresAt: now.add(REFRESH_TOKEN_EXPIRATION_HOURS, 'hour'),
      firstIssuedAt: issuedAt.toDate(),
      refreshCount: 0,
      isRevoked: false,
    });

    this.logger.debug('Created refresh token', {
      tokenId,
      userId,
      expiresAt: now.add(REFRESH_TOKEN_EXPIRATION_HOURS, 'hour').toISOString(),
    });

    // Encrypt token before returning (frontend stores encrypted version)
    return encryptRefreshToken(tokenId);
  }

  /**
   * Refreshes access token using refresh token (with rotation)
   * @param encryptedRefreshToken - Encrypted refresh token from header (with prefix/suffix)
   */
  async refreshAccessToken(
    encryptedRefreshToken: string,
    deviceInfo?: {
      deviceId?: string;
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<{
    userId: string;
    authId: string;
    newRefreshToken: string;
  }> {
    // Decrypt refresh token from header
    const refreshTokenId = decryptRefreshToken(encryptedRefreshToken);

    // Validate refresh token
    const token = await this.validateRefreshToken(refreshTokenId, deviceInfo);

    const now = dayjs();

    // Update token usage
    const tokenDoc = token as RefreshTokenDocument;
    await this.findByIdAndUpdate(tokenDoc.id, {
      lastUsedAt: now.toDate(),
      refreshCount: token.refreshCount + 1,
      lastRefreshAt: now.toDate(),
    });

    // Generate new refresh token (rotation) - preserve firstIssuedAt
    const firstIssuedDate =
      // eslint-disable-next-line no-restricted-globals
      tokenDoc.firstIssuedAt instanceof Date
        ? tokenDoc.firstIssuedAt
        : dayjs(tokenDoc.firstIssuedAt).toDate();
    const newRefreshTokenId = await this.createRefreshToken(
      token.userId,
      token.authId,
      deviceInfo,
      firstIssuedDate, // Preserve original issue date for max lifetime
    );

    // Revoke and blacklist old token
    await this.revokeRefreshToken(token.tokenId, 'rotated');

    // Note: We can't blacklist the encrypted refresh token here because we don't have it
    // The blacklisting happens at the database level (isRevoked flag)
    // For immediate blacklisting of encrypted tokens, it should be done at controller level

    // Audit trail for token refresh
    this.auditTrailService.createAuditEntryAsync({
      processType: AuditTrailProcessType.INTERNAL_PROCESS,
      userId: token.userId,
      action: AuditAction.TOKEN_REFRESHED,
      resource: 'RefreshToken',
      resourceId: token.tokenId,
      ipAddress: deviceInfo?.ipAddress,
      userAgent: deviceInfo?.userAgent,
      metadata: {
        oldTokenId: token.tokenId,
        newTokenId: newRefreshTokenId,
        refreshCount: token.refreshCount + 1,
        operation: 'token_rotation',
      },
    });

    this.logger.debug('Refreshed access token', {
      userId: token.userId,
      oldTokenId: token.tokenId,
      newTokenId: newRefreshTokenId,
    });

    return {
      userId: token.userId,
      authId: token.authId,
      newRefreshToken: newRefreshTokenId,
    };
  }

  /**
   * Validates refresh token expiration (multiple layers)
   */
  private async validateRefreshTokenExpiration(
    token: RefreshToken | RefreshTokenDocument,
  ): Promise<{ valid: boolean; reason?: string }> {
    const now = dayjs();

    // Check fixed expiration
    if (dayjs(token.expiresAt).isBefore(now)) {
      return { valid: false, reason: 'expired' };
    }

    // Check maximum session lifetime
    const hoursSinceFirstIssued = now.diff(dayjs(token.firstIssuedAt), 'hour');
    if (hoursSinceFirstIssued > MAX_SESSION_LIFETIME_HOURS) {
      return { valid: false, reason: 'max_lifetime_reached' };
    }

    // Check inactivity timeout
    if (token.lastUsedAt) {
      const hoursSinceLastUse = now.diff(dayjs(token.lastUsedAt), 'hour');
      if (hoursSinceLastUse > REFRESH_TOKEN_INACTIVITY_HOURS) {
        return { valid: false, reason: 'inactivity' };
      }
    }

    // Check rate limiting (refreshes per day)
    if (token.lastRefreshAt) {
      const lastRefreshDate = dayjs(token.lastRefreshAt).startOf('day');
      const today = now.startOf('day');
      if (lastRefreshDate.isSame(today)) {
        // Same day - check count
        if (token.refreshCount >= MAX_REFRESH_ATTEMPTS_PER_DAY) {
          return { valid: false, reason: 'rate_limit' };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Revokes a specific refresh token
   * Also blacklists the token for immediate invalidation
   */
  async revokeRefreshToken(tokenId: string, reason?: string): Promise<void> {
    // Get token info for audit trail before revoking
    const token = await this.findOne({ tokenId });
    const userId = token?.userId;

    await this.updateMany(
      { tokenId, isRevoked: false },
      {
        isRevoked: true,
        revokedAt: dayjs().toDate(),
        revokedReason: reason,
      },
    );

    // Audit trail for token revocation
    if (userId) {
      this.auditTrailService.createAuditEntryAsync({
        processType: AuditTrailProcessType.INTERNAL_PROCESS,
        userId,
        action: AuditAction.TOKEN_REVOKED,
        resource: 'RefreshToken',
        resourceId: tokenId,
        metadata: {
          reason: reason || 'revoked',
          operation: 'single_token_revocation',
        },
      });
    }

    // Blacklist the token for immediate invalidation
    // Note: We blacklist the tokenId, but in practice we'd need the encrypted token
    // This is handled at the controller level where we have the encrypted token
    this.logger.debug('Revoked refresh token', { tokenId, reason });
  }

  /**
   * Revokes all refresh tokens for a user
   * Also triggers blacklist for user's tokens
   */
  async revokeAllUserTokens(userId: string, reason?: string): Promise<void> {
    const result = await this.updateMany(
      { userId, isRevoked: false },
      {
        isRevoked: true,
        revokedAt: dayjs().toDate(),
        revokedReason: reason,
      },
    );

    // Blacklist all user tokens
    // await this.tokenBlacklistService.blacklistUserTokens(userId, reason);

    // Audit trail for bulk token revocation
    this.auditTrailService.createAuditEntryAsync({
      processType: AuditTrailProcessType.INTERNAL_PROCESS,
      userId,
      action: AuditAction.TOKEN_REVOKED,
      resource: 'User',
      resourceId: userId,
      metadata: {
        reason: reason || 'bulk_revocation',
        operation: 'revoke_all_user_tokens',
        tokensRevoked: result.modifiedCount,
      },
    });

    this.logger.log('Revoked all refresh tokens for user', {
      userId,
      count: result.modifiedCount,
      reason,
    });
  }


  
  /**
   * Validates IP address change for suspicious activity detection
   * @param originalIp - IP address when token was created
   * @param currentIp - Current IP address from request
   * @returns Validation result with severity
   */
  private validateIpAddress(
    originalIp: string,
    currentIp: string,
  ): { valid: boolean; severity: 'low' | 'high'; reason?: string } {
    // Skip validation for local/private IPs
    if (
      originalIp === '127.0.0.1' ||
      originalIp === '::1' ||
      currentIp === '127.0.0.1' ||
      currentIp === '::1' ||
      originalIp.startsWith('192.168.') ||
      originalIp.startsWith('10.') ||
      originalIp.startsWith('172.') ||
      currentIp.startsWith('192.168.') ||
      currentIp.startsWith('10.') ||
      currentIp.startsWith('172.')
    ) {
      return { valid: true, severity: 'low' };
    }

    // Same IP - valid
    if (originalIp === currentIp) {
      return { valid: true, severity: 'low' };
    }

    // Extract IP components for comparison
    const getIpComponents = (ip: string) => {
      // IPv4: a.b.c.d
      const parts = ip.split('.');
      if (parts.length === 4) {
        return {
          type: 'ipv4',
          parts: parts.map((p) => parseInt(p, 10)),
        };
      }
      // IPv6: simplified comparison
      return { type: 'ipv6', address: ip };
    };

    const original = getIpComponents(originalIp);
    const current = getIpComponents(currentIp);

    // Different IP types - suspicious
    if (original.type !== current.type) {
      return {
        valid: false,
        severity: 'high',
        reason: 'IP type mismatch (IPv4 vs IPv6)',
      };
    }

    // IPv4 comparison
    if (original.type === 'ipv4' && current.type === 'ipv4') {
      // Same first 3 octets (same subnet) - low severity
      // if (
      //   original.parts[0] === current.parts[0] &&
      //   original.parts[1] === current.parts[1] &&
      //   original.parts[2] === current.parts[2]
      // ) {
      //   return {
      //     valid: true,
      //     severity: 'low',
      //     reason: 'Same subnet',
      //   };
      // }

      // Different country/region - high severity
      // Note: Full geolocation would require external service
      // For now, we'll flag major changes (different first octet) as high severity
      // if (original.parts[0] !== current.parts[0]) {
      //   return {
      //     valid: false,
      //     severity: 'high',
      //     reason: 'Major IP change (different network class)',
      //   };
      // }

      // Same first octet but different subnet - medium severity (log but allow)
      return {
        valid: true,
        severity: 'low',
        reason: 'Different subnet, same network class',
      };
    }

    // IPv6 - simplified: if completely different, flag as suspicious
    if (original.type === 'ipv6' && current.type === 'ipv6') {
      // For IPv6, we'll be more lenient (could be legitimate changes)
      return {
        valid: true,
        severity: 'low',
        reason: 'IPv6 address change',
      };
    }

    return { valid: true, severity: 'low' };
  }



  /**
   * Validates refresh token and checks for reuse
   */
  async validateRefreshToken(
    tokenId: string,
    deviceInfo?: {
      deviceId?: string;
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<RefreshToken | RefreshTokenDocument> {
    const token = await this.findOne({
      tokenId,
      isRevoked: false,
    });

    if (!token) {
      return handleAndThrowError(
        new HttpException(
          'Invalid or revoked refresh token',
          HttpStatus.UNAUTHORIZED,
        ),
        this.logger,
        'Refresh token not found or revoked',
      );
    }

    // Check expiration (multiple layers)
    const expirationCheck = await this.validateRefreshTokenExpiration(token);
    if (!expirationCheck.valid) {
      // Mark as revoked
      await this.revokeRefreshToken(tokenId, expirationCheck.reason);
      return handleAndThrowError(
        new HttpException(
          'Refresh token expired. Please sign in again.',
          HttpStatus.UNAUTHORIZED,
        ),
        this.logger,
        `Refresh token expired: ${expirationCheck.reason}`,
      );
    }

    // Check for token reuse (if lastUsedAt exists, token was already used)
    if (token.lastUsedAt) {
      // Record suspicious activity
      // await this.securityMonitor.recordTokenReuse(token.userId, {
      //   tokenId: token.tokenId,
      //   lastUsedAt: token.lastUsedAt,
      //   currentAttempt: dayjs().toDate(),
      // });

      // Audit trail for token reuse
      this.auditTrailService.createAuditEntryAsync({
        processType: AuditTrailProcessType.INTERNAL_PROCESS,
        userId: token.userId,
        action: AuditAction.TOKEN_REUSE_DETECTED,
        resource: 'RefreshToken',
        resourceId: token.tokenId,
        metadata: {
          reason: 'token_reuse_detected',
          lastUsedAt: token.lastUsedAt,
          severity: 'high',
        },
      });

      // Potential security breach - revoke all tokens
      await this.revokeAllUserTokens(token.userId, 'token_reuse_detected');
      return handleAndThrowError(
        new HttpException(
          'Token reuse detected. All sessions have been revoked for security.',
          HttpStatus.UNAUTHORIZED,
        ),
        this.logger,
        'Token reuse detected - security breach',
      );
    }

    // Optional: Device binding check
    if (deviceInfo?.deviceId && token.deviceId) {
      if (deviceInfo.deviceId !== token.deviceId) {
        // Audit trail for device mismatch
        this.auditTrailService.createAuditEntryAsync({
          processType: AuditTrailProcessType.INTERNAL_PROCESS,
          userId: token.userId,
          action: AuditAction.DEVICE_MISMATCH_DETECTED,
          resource: 'RefreshToken',
          resourceId: token.tokenId,
          metadata: {
            reason: 'device_mismatch',
            originalDeviceId: token.deviceId,
            attemptedDeviceId: deviceInfo.deviceId,
          },
        });

        await this.revokeRefreshToken(tokenId, 'device_mismatch');
        return handleAndThrowError(
          new HttpException(
            'Device mismatch detected. Please sign in again.',
            HttpStatus.UNAUTHORIZED,
          ),
          this.logger,
          'Device mismatch detected',
        );
      }
    }

    // IP address validation (suspicious activity detection)
    if (deviceInfo?.ipAddress && token.ipAddress) {
      const ipValidation = this.validateIpAddress(
        token.ipAddress,
        deviceInfo.ipAddress,
      );

      if (!ipValidation.valid) {
        // Log suspicious activity but allow if it's just a minor change
        if (ipValidation.severity === 'high') {
          // Major IP change - record and revoke token
          // await this.securityMonitor.recordSuspiciousActivity({
          //   type: 'ip_change',
          //   userId: token.userId,
          //   severity: 'high',
          //   details: {
          //     originalIp: token.ipAddress,
          //     newIp: deviceInfo.ipAddress,
          //     reason: ipValidation.reason,
          //   },
          //   timestamp: dayjs().toDate(),
          // });

          // Audit trail for IP validation failure
          this.auditTrailService.createAuditEntryAsync({
            processType: AuditTrailProcessType.INTERNAL_PROCESS,
            userId: token.userId,
            action: AuditAction.IP_VALIDATION_FAILED,
            resource: 'RefreshToken',
            resourceId: token.tokenId,
            ipAddress: deviceInfo.ipAddress,
            metadata: {
              reason: ipValidation.reason,
              severity: 'high',
              originalIp: token.ipAddress,
              newIp: deviceInfo.ipAddress,
              action: 'token_revoked',
            },
          });

          await this.revokeRefreshToken(tokenId, 'suspicious_ip_change');
          this.logger.warn('Suspicious IP change detected - token revoked', {
            userId: token.userId,
            originalIp: token.ipAddress,
            newIp: deviceInfo.ipAddress,
            reason: ipValidation.reason,
          });
          return handleAndThrowError(
            new HttpException(
              'Suspicious activity detected. Please sign in again.',
              HttpStatus.UNAUTHORIZED,
            ),
            this.logger,
            'Suspicious IP change',
          );
        } else {
          // Minor IP change - log but allow (could be VPN, mobile network, etc.)
          // await this.securityMonitor.recordSuspiciousActivity({
          //   type: 'ip_change',
          //   userId: token.userId,
          //   severity: 'low',
          //   details: {
          //     originalIp: token.ipAddress,
          //     newIp: deviceInfo.ipAddress,
          //     reason: ipValidation.reason,
          //   },
          //   timestamp: dayjs().toDate(),
          // });

          // Audit trail for minor IP change (logged but allowed)
          this.auditTrailService.createAuditEntryAsync({
            processType: AuditTrailProcessType.INTERNAL_PROCESS,
            userId: token.userId,
            action: AuditAction.IP_VALIDATION_FAILED,
            resource: 'RefreshToken',
            resourceId: token.tokenId,
            ipAddress: deviceInfo.ipAddress,
            metadata: {
              reason: ipValidation.reason,
              severity: 'low',
              originalIp: token.ipAddress,
              newIp: deviceInfo.ipAddress,
              action: 'logged_allowed',
            },
          });

          this.logger.warn('IP address change detected', {
            userId: token.userId,
            originalIp: token.ipAddress,
            newIp: deviceInfo.ipAddress,
            reason: ipValidation.reason,
          });
        }
      }
    }

    // Detect rapid refresh attempts
    if (token.refreshCount > 0 && token.lastRefreshAt) {
      const minutesSinceLastRefresh = dayjs().diff(
        dayjs(token.lastRefreshAt),
        'minute',
      );
      // await this.securityMonitor.detectRapidRefresh(
      //   token.userId,
      //   token.refreshCount,
      //   minutesSinceLastRefresh,
      // );
    }

    return token;
  }
}
