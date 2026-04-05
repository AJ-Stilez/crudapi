import { Schema } from 'mongoose';
import { createSchema } from 'src/utils/mongoose-schema.utils';
import {
  AuditTrail,
  AuditTrailProcessType,
} from 'src/schema/class/audit-trail.schema.class';

export const AuditTrailSchemaModel = createSchema<AuditTrail>(
  {
    processType: {
      type: String,
      enum: Object.values(AuditTrailProcessType),
      required: [true, 'Process type is required'],
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      index: true,
    },
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    method: {
      type: String,
      index: true,
    },
    path: {
      type: String,
      index: true,
    },
    externalUrl: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    requestData: {
      type: Schema.Types.Mixed,
    },
    responseData: {
      type: Schema.Types.Mixed,
    },
    statusCode: {
      type: Number,
      index: true,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    loadClass: true,
    softDelete: false,
    auditFields: false,
    indexes: [
      { fields: { processType: 1, createdAt: -1 } },
      { fields: { userId: 1, createdAt: -1 } },
      { fields: { resource: 1, resourceId: 1 } },
      { fields: { action: 1, createdAt: -1 } },
      { fields: { path: 1, createdAt: -1 } },
      { fields: { externalUrl: 1, createdAt: -1 } },
      { fields: { createdAt: -1 } },
      { fields: { method: 1, path: 1 } },
    ],
  },
);
