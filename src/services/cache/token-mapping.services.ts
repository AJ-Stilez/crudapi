/**
 * Token Mapping Service
 *
 * This service manages the mapping between opaque identifiers used in JWT tokens
 * and the actual user/entity IDs. This prevents exposing real IDs in tokens while
 * maintaining the ability to resolve them server-side.
 *
 * Security Benefits:
 * - Prevents user enumeration attacks
 * - Hides internal ID structure
 * - Allows token revocation
 * - Prevents correlation across systems
 *
 * @module TokenMappingService
 */

import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { CacheService } from './cache.services';
import { TOKEN_MAPPING_TTL_SECONDS } from 'src/constants/security.constant';

/**
 * Interface for token mapping data stored in cache
 */
export interface TokenMappingData {
  /** The actual user ID */
  userId: string;
  /** The actual auth ID */
  authId: string;
  /** Optional estate ID */
  estateId?: string;
  /** Optional access control point ID */
  acpId?: string;
  /** Access type (USER, ESTATE, GUARD, etc.) */
  accessType: string;
  /** Timestamp when the mapping was created */
  createdAt: number;
  /** JTI (JWT ID) associated with this mapping */
  jti?: string;
}

@Injectable()
export class TokenMappingService {
  private readonly CACHE_PREFIX = 'token_mapping:';
  private readonly MAPPING_TTL = TOKEN_MAPPING_TTL_SECONDS; // Slightly longer than token expiration
  private readonly REVERSE_PREFIX = 'token_mapping_reverse:';

  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: Logger,
  ) {}

  /**
   * Generates a cache key for token mapping
   * @param opaqueId - The opaque identifier
   * @returns Cache key string
   */
  private getMappingKey(opaqueId: string): string {
    return `${this.CACHE_PREFIX}${opaqueId}`;
  }

  /**
   * Generates a reverse cache key (from real ID to opaque ID)
   * @param realId - The real ID
   * @param type - The type of ID (userId, authId, estateId, acpId)
   * @returns Cache key string
   */
  private getReverseKey(realId: string, type: string): string {
    return `${this.REVERSE_PREFIX}${type}:${realId}`;
  }

  /**
   * Creates opaque identifiers for sensitive data
   * @param data - The real IDs to create mappings for
   * @returns Object containing opaque identifiers
   */
  async createMappings(data: {
    userId: string;
    authId: string;
    accessType: string;
    // estateId?: string;
    // acpId?: string;
    jti?: string;
  }): Promise<{
    opaqueUserId: string;
    opaqueAuthId: string;
    // opaqueEstateId?: string;
    // opaqueAcpId?: string;
  }> {
    // Generate opaque identifiers
    const opaqueUserId = uuidv4();
    const opaqueAuthId = uuidv4();
    // const opaqueEstateId = data.estateId ? uuidv4() : undefined;
    // const opaqueAcpId = data.acpId ? uuidv4() : undefined;

    // Create mapping data
    const mappingData: TokenMappingData = {
      userId: data.userId,
      authId: data.authId,
    //   estateId: data.estateId,
    //   acpId: data.acpId,
      accessType: data.accessType,
      createdAt: dayjs().valueOf(),
      jti: data.jti,
    };

    // Store mappings in cache with TTL
    // Store forward mappings (opaque -> real)
    await Promise.all([
      this.cacheService.set(
        this.getMappingKey(opaqueUserId),
        mappingData,
        this.MAPPING_TTL,
      ),
      this.cacheService.set(
        this.getMappingKey(opaqueAuthId),
        mappingData,
        this.MAPPING_TTL,
      ),
    //   opaqueEstateId &&
    //     this.cacheService.set(
    //       this.getMappingKey(opaqueEstateId),
    //       mappingData,
    //       this.MAPPING_TTL,
    //     ),
    //   opaqueAcpId &&
    //     this.cacheService.set(
    //       this.getMappingKey(opaqueAcpId),
    //       mappingData,
    //       this.MAPPING_TTL,
    //     ),
    ]);

    // Store reverse mappings for quick lookup (optional, for revocation)
    // This allows us to find all opaque IDs for a real ID
    const reverseKeys = [
      this.getReverseKey(data.userId, 'userId'),
      this.getReverseKey(data.authId, 'authId'),
    ];

    // if (data.estateId) {
    //   reverseKeys.push(this.getReverseKey(data.estateId, 'estateId'));
    // }

    // if (data.acpId) {
    //   reverseKeys.push(this.getReverseKey(data.acpId, 'acpId'));
    // }

    // Store reverse mappings with list of opaque IDs
    await Promise.all(
      reverseKeys.map(async (key) => {
        const existing = await this.cacheService.get<string[]>(key);
        const opaqueIds = existing || [];
        const newOpaqueIds = [
          opaqueUserId,
          opaqueAuthId,
        //   ...(opaqueEstateId ? [opaqueEstateId] : []),
        //   ...(opaqueAcpId ? [opaqueAcpId] : []),
        ];
        // Merge and deduplicate
        const merged = Array.from(new Set([...opaqueIds, ...newOpaqueIds]));
        return this.cacheService.set(key, merged, this.MAPPING_TTL);
      }),
    );

    this.logger.debug('Created token mappings', {
      opaqueUserId,
      realUserId: data.userId,
      accessType: data.accessType,
    });

    return {
      opaqueUserId,
      opaqueAuthId,
    //   opaqueEstateId,
    //   opaqueAcpId,
    };
  }

  /**
   * Resolves opaque identifiers to real IDs
   * @param opaqueIds - Object containing opaque identifiers
   * @returns Resolved real IDs or null if mapping not found
   */
  async resolveMappings(opaqueIds: {
    opaqueUserId?: string;
    opaqueAuthId?: string;
    opaqueEstateId?: string;
    opaqueAcpId?: string;
  }): Promise<TokenMappingData | null> {
    // Try to resolve from any of the provided opaque IDs
    const keysToTry = [
      opaqueIds.opaqueUserId && this.getMappingKey(opaqueIds.opaqueUserId),
      opaqueIds.opaqueAuthId && this.getMappingKey(opaqueIds.opaqueAuthId),
      opaqueIds.opaqueEstateId && this.getMappingKey(opaqueIds.opaqueEstateId),
      opaqueIds.opaqueAcpId && this.getMappingKey(opaqueIds.opaqueAcpId),
    ].filter(Boolean) as string[];

    if (keysToTry.length === 0) {
      return null;
    }

    // Try each key until we find a mapping
    for (const key of keysToTry) {
      const mapping = await this.cacheService.get<TokenMappingData>(key);
      if (mapping) {
        return mapping;
      }
    }

    return null;
  }

  /**
   * Revokes all token mappings for a given real ID
   * Useful for logout, password change, or security incidents
   * @param realId - The real ID to revoke mappings for
   * @param type - The type of ID (userId, authId, estateId, acpId)
   */
  async revokeMappingsByRealId(
    realId: string,
    type: 'userId' | 'authId' | 'estateId' | 'acpId',
  ): Promise<void> {
    const reverseKey = this.getReverseKey(realId, type);
    const opaqueIds = await this.cacheService.get<string[]>(reverseKey);

    if (!opaqueIds || opaqueIds.length === 0) {
      this.logger.debug('No mappings found to revoke', { realId, type });
      return;
    }

    // Delete all forward mappings
    await Promise.all(
      opaqueIds.map((opaqueId) =>
        this.cacheService.del(this.getMappingKey(opaqueId)),
      ),
    );

    // Delete reverse mapping
    await this.cacheService.del(reverseKey);

    this.logger.log('Revoked token mappings', {
      realId,
      type,
      count: opaqueIds.length,
    });
  }

  /**
   * Revokes a specific token mapping by opaque ID
   * @param opaqueId - The opaque identifier to revoke
   */
  async revokeMapping(opaqueId: string): Promise<void> {
    const mapping = await this.resolveMappings({ opaqueUserId: opaqueId });
    if (!mapping) {
      return;
    }

    // Delete forward mapping
    await this.cacheService.del(this.getMappingKey(opaqueId));

    // Update reverse mappings
    const reverseKeys = [
      this.getReverseKey(mapping.userId, 'userId'),
      this.getReverseKey(mapping.authId, 'authId'),
    ];

    if (mapping.estateId) {
      reverseKeys.push(this.getReverseKey(mapping.estateId, 'estateId'));
    }

    if (mapping.acpId) {
      reverseKeys.push(this.getReverseKey(mapping.acpId, 'acpId'));
    }

    await Promise.all(
      reverseKeys.map(async (key) => {
        const existing = await this.cacheService.get<string[]>(key);
        if (existing) {
          const filtered = existing.filter((id) => id !== opaqueId);
          if (filtered.length > 0) {
            await this.cacheService.set(key, filtered, this.MAPPING_TTL);
          } else {
            await this.cacheService.del(key);
          }
        }
      }),
    );

    this.logger.debug('Revoked token mapping', { opaqueId });
  }

  /**
   * Extends the TTL of a mapping (useful for refresh tokens)
   * @param opaqueId - The opaque identifier
   * @param additionalSeconds - Additional seconds to add to TTL
   */
  async extendMappingTTL(
    opaqueId: string,
    additionalSeconds: number = this.MAPPING_TTL,
  ): Promise<void> {
    const mapping = await this.resolveMappings({ opaqueUserId: opaqueId });
    if (!mapping) {
      return;
    }

    // Re-store with extended TTL
    await this.cacheService.set(
      this.getMappingKey(opaqueId),
      mapping,
      additionalSeconds,
    );

    this.logger.debug('Extended mapping TTL', { opaqueId, additionalSeconds });
  }
}
