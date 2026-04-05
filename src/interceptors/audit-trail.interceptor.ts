/**
 *
 * Automatically logs all HTTP requests to the audit trail system.
 * Captures user actions, request/response data, and metadata.
 *
 * @module AuditTrailInterceptor
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

import { Logger } from 'nestjs-pino';
import dayjs from 'dayjs';
import { determineAction, extractIpAddress, extractResourceInfo, sanitizeData } from 'src/utils/audit.utils';
import { AuditTrailProcessType } from 'src/schema/class/audit-trail.schema.class';
import { AuditTrailService } from 'src/services/audit-trail.service';


@Injectable()
export class AuditTrailInterceptor implements NestInterceptor {
  constructor(
    private readonly auditTrailService: AuditTrailService,
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Extract request information
    const method = request.method;
    const path = request.path;
    const ipAddress = extractIpAddress(
      request.headers,
      request.ip,
      request.socket.remoteAddress,
    );
    const userAgent = request.headers['user-agent'];

    // Get user from request (set by auth guards)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user;
    const userId = user?.userId || user?.id || undefined;

    // Extract resource information
    const { resource, resourceId } = extractResourceInfo(path);
    const action = determineAction(method, path);

    // Sanitize request data
    const requestData = sanitizeData({
      body: request.body,
      query: request.query,
      params: request.params,
    });

    // Track start time for performance
    const startTime = dayjs().valueOf();

    return next.handle().pipe(
      tap((responseData) => {
        // Log successful request
        const statusCode = response.statusCode || 200;
        const sanitizedResponse = sanitizeData(responseData);

        this.auditTrailService.createAuditEntryAsync({
          processType: AuditTrailProcessType.INCOMING_REQUEST,
          userId,
          action,
          resource,
          resourceId: resourceId || request.params?.id || request.body?.id,
          method,
          path,
          ipAddress,
          userAgent,
          requestData,
          responseData: sanitizedResponse,
          statusCode,
          metadata: {
            duration: dayjs().valueOf() - startTime,
          },
        });
      }),
      catchError((error) => {
        // Log failed request
        const statusCode = error.status || error.statusCode || 500;
        const errorMessage =
          error.message || error.response?.message || 'Unknown error';

        this.auditTrailService.createAuditEntryAsync({
          processType: AuditTrailProcessType.INCOMING_REQUEST,
          userId,
          action,
          resource,
          resourceId: resourceId || request.params?.id || request.body?.id,
          method,
          path,
          ipAddress,
          userAgent,
          requestData,
          statusCode,
          errorMessage,
          metadata: {
            duration: dayjs().valueOf() - startTime,
            errorType: error.constructor?.name || 'Error',
          },
        });

        // Re-throw the error
        throw error;
      }),
    );
  }
}
