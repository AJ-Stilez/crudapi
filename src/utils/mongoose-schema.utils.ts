/**
 *  __  __                       _
 * |  \/  |                     (_)
 * | \  / | ___  _ __   __ _  ___ _ __   __ _  ___
 * | |\/| |/ _ \| '_ \ / _` |/ __| '_ \ / _` |/ _ \
 * | |  | | (_) | | | | (_| | (__| | | | (_| |  __/
 * |_|  |_|\___/|_| |_|\__, |\___|_| |_|\__, |\___|
 *                      __/ |            __/ |
 *                     |___/            |___/
 *
 * Mongoose Schema Utilities - The Schema Sculptors
 *
 * @module MongooseSchemaUtils
 * @internal
 *
 * 🏗️ These utilities are like the architects of your database -
 *    they design the perfect structure for your data! 🏛️
 */
import {
  Schema,
  SchemaOptions,
  SchemaDefinition,
  SchemaTypeOptions,
  Types,
  Model,
  FilterQuery,
} from 'mongoose';
import {
  ExtendedSchemaOptions,
  SoftDeleteDocument,
} from 'src/types/mongoose.types';
import dayjs from 'dayjs';

const defaultOptions: SchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  validateBeforeSave: true,
};

export type FieldMap = Record<string, string>;

/**
 * Creates a Mongoose schema with support for common enterprise features like:
 * - Timestamps
 * - Virtuals in JSON/Object
 * - Optional soft delete functionality
 * - Optional audit tracking fields
 * - Custom schema class loading
 * - Plugin support
 * - Schema extension hooks
 *
 * @template T - Interface representing the schema's structure
 *
 * @param definition - Schema definition object
 * @param options - Extended schema configuration options
 * @returns A configured `Schema<T>` instance
 *
 * @example
 * const UserSchema = createSchema<User>({
 *   name: String,
 *   email: String,
 * }, {
 *   auditFields: true,
 *   softDelete: true,
 *   loadClass: UserClass,
 * });
 *
 * const UserModel = mongoose.model<User>('User', UserSchema);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSchema<T = any>(
  definition: SchemaDefinition<T>,
  options: ExtendedSchemaOptions<T> = {},
): Schema<T> {
  const {
    loadClass,
    plugins = [],
    softDelete,
    auditFields,
    extendSchema,
    auditFieldOptions = {},
    ...schemaOptions
  } = options;

  const mergedOptions = { ...defaultOptions, ...schemaOptions };
  const defaultRef = 'User';
  const objectId = Schema.Types.ObjectId;

  // Add soft delete and audit fields
  if (softDelete || auditFields) {
    definition['deletedAt'] = {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      default: null,
      index: true,
      // eslint-disable-next-line no-restricted-globals
    } as SchemaTypeOptions<Date | null>;
  }

  if (auditFields) {
    definition['createdById'] = {
      type: objectId,
      default: null,
      ref: auditFieldOptions.createdByRef || defaultRef,
    };

    definition['updatedById'] = {
      type: objectId,
      default: null,
      ref: auditFieldOptions.updatedByRef || defaultRef,
    };

    definition['deletedById'] = {
      type: objectId,
      default: null,
      ref: auditFieldOptions.deletedByRef || defaultRef,
    };
  }

  // Main schema definition - Using new Schema() to prevent infinite recursion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,no-restricted-syntax,residential/use-create-schema
  const schema = new Schema(definition as any, mergedOptions) as any;

  // Soft delete static methods
  if (softDelete) {
    schema.static('findActive', function () {
      return this.find({ deletedAt: null });
    });

    schema.static(
      'softDeleteById',
      function (
        id: Types.ObjectId | string,
        deletedById: Types.ObjectId | string | null = null,
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: any = { deletedAt: dayjs().toDate() };
        if (auditFields && deletedById) {
          update.deletedById = deletedById;
        }
        return this.findByIdAndUpdate(id, update, { new: true });
      },
    );

    schema.static('restoreById', function (id: Types.ObjectId | string) {
      return this.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
    });

    // Instance method to check soft-deletion
    schema.method(
      'isSoftDeleted',
      function (this: SoftDeleteDocument): boolean {
        return !!this.deletedAt;
      },
    );

    // Middleware to exclude soft-deleted records by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const excludeDeletedMiddleware = function (this: any) {
      const opts = this.getOptions?.() ?? {};
      if (!opts.includeDeleted) {
        this.where({ deletedAt: null });
      }
    };

    schema.pre('find', excludeDeletedMiddleware);
    schema.pre('findOne', excludeDeletedMiddleware);
    schema.pre('countDocuments', excludeDeletedMiddleware);
    schema.pre('findOneAndUpdate', excludeDeletedMiddleware);
  }

  // Load class methods if specified
  // if (loadClass) {
  //   schema.loadClass(loadClass);
  // }
  if (loadClass === true) {
    const DynamicClass = generateMongooseClass(definition);
    schema.loadClass(DynamicClass);
  } else if (typeof loadClass === 'function') {
    schema.loadClass(loadClass);
  }

  // Apply plugins if specified
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) {
      const [fn, pluginOptions] = plugin;
      schema.plugin(fn, pluginOptions);
    } else {
      schema.plugin(plugin);
    }
  }

  // Extend schema if required
  if (extendSchema) {
    extendSchema(schema);
  }

  if (options.indexes) {
    for (const { fields, options: idxOptions } of options.indexes) {
      schema.index(fields, idxOptions);
    }
  }

  return schema;
}

export function generateMongooseClass<T>(
  definition: SchemaDefinition<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): new () => any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classDef: any = class {
    readonly id?: string;
  };

  for (const [key] of Object.entries(definition)) {
    Object.defineProperty(classDef.prototype, key, {
      configurable: true,
      enumerable: true,
      writable: true,
    });
  }

  return classDef;
}

export function softDelete<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  deletedById?: string,
): Promise<T | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: any = { deletedAt: dayjs().toDate() };

  if (deletedById) {
    update.deletedById = deletedById;
  }

  return model
    .findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true },
    )
    .exec();
}

// export function generateMongooseModelCode(
//   className: string,
//   fields: Record<string, string>,
//   collectionName?: string,
// ): string {
//   const nonDocName = `NonDocument${className}`;
//   const schemaClassName = `${className}SchemaClass`;
//   const documentName = className;
//   const docType = `${documentName}Document`;
//   const createAttrs = `Create${className}Attributes`;
//   const schemaVar = `${className}Schema`;
//   const modelVar = `${className}Model`;
//   const modelName = className;
//   const schemaDefVar = `${className}SchemaDef`;
//
//   const indent = (lines: string[], level = 2) =>
//     lines.map((line) => ' '.repeat(level) + line).join('\n');
//
//   const fieldLines = Object.entries(fields).map(([key, type]) => {
//     const optional = type.endsWith('?');
//     const cleanedType = type.replace(/\?$/, '');
//     return `${key}${optional ? '?' : ''}: ${cleanedType};`;
//   });
//
//   const schemaFields = Object.entries(fields).map(([key, type]) => {
//     const optional = type.endsWith('?');
//     const cleanedType = type.replace(/\?$/, '').toLowerCase();
//     const typeMap: Record<string, string> = {
//       string: 'String',
//       number: 'Number',
//       boolean: 'Boolean',
//       date: 'Date',
//       objectid: 'Schema.Types.ObjectId',
//     };
//     const mongooseType = typeMap[cleanedType] || 'Schema.Types.Mixed';
//     return `  ${key}: { type: ${mongooseType}${
//       optional ? ', required: false' : ', required: true'
//     } },`;
//   });
//
//   return `
// import { Schema, model, Document } from 'mongoose';
//
// export class ${nonDocName} {
// ${indent(fieldLines)}
// }
//
// export ${'interface'} ${documentName}
//   extends Readonly<${nonDocName}>, Document {}
//
// export class ${schemaClassName} extends ${nonDocName} {
//   readonly id?: string;
// }
//
// export type ${docType} = ${documentName} & ${schemaClassName};
//
// export type ${createAttrs} = ${nonDocName} & {
//   id?: string;
//   _id?: string;
// };
//
// const ${schemaDefVar} = {
// ${schemaFields.join('\n')}
// };
//
// export const ${schemaVar} = new Schema<${documentName}>(${schemaDefVar}, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true },
// });
//
// ${schemaVar}.loadClass(${schemaClassName});
//
// export const ${modelVar} = model<${docType}>('${modelName}', ${schemaVar}${
//     collectionName ? `, '${collectionName}'` : ''
//   });
// `.trim();
// }
