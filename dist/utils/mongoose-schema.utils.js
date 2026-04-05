"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchema = createSchema;
exports.generateMongooseClass = generateMongooseClass;
exports.softDelete = softDelete;
const mongoose_1 = require("mongoose");
const dayjs_1 = __importDefault(require("dayjs"));
const defaultOptions = {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    validateBeforeSave: true,
};
function createSchema(definition, options = {}) {
    const { loadClass, plugins = [], softDelete, auditFields, extendSchema, auditFieldOptions = {}, ...schemaOptions } = options;
    const mergedOptions = { ...defaultOptions, ...schemaOptions };
    const defaultRef = 'User';
    const objectId = mongoose_1.Schema.Types.ObjectId;
    if (softDelete || auditFields) {
        definition['deletedAt'] = {
            type: Date,
            default: null,
            index: true,
        };
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
    const schema = new mongoose_1.Schema(definition, mergedOptions);
    if (softDelete) {
        schema.static('findActive', function () {
            return this.find({ deletedAt: null });
        });
        schema.static('softDeleteById', function (id, deletedById = null) {
            const update = { deletedAt: (0, dayjs_1.default)().toDate() };
            if (auditFields && deletedById) {
                update.deletedById = deletedById;
            }
            return this.findByIdAndUpdate(id, update, { new: true });
        });
        schema.static('restoreById', function (id) {
            return this.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
        });
        schema.method('isSoftDeleted', function () {
            return !!this.deletedAt;
        });
        const excludeDeletedMiddleware = function () {
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
    if (loadClass === true) {
        const DynamicClass = generateMongooseClass(definition);
        schema.loadClass(DynamicClass);
    }
    else if (typeof loadClass === 'function') {
        schema.loadClass(loadClass);
    }
    for (const plugin of plugins) {
        if (Array.isArray(plugin)) {
            const [fn, pluginOptions] = plugin;
            schema.plugin(fn, pluginOptions);
        }
        else {
            schema.plugin(plugin);
        }
    }
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
function generateMongooseClass(definition) {
    const classDef = class {
        id;
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
function softDelete(model, filter, deletedById) {
    const update = { deletedAt: (0, dayjs_1.default)().toDate() };
    if (deletedById) {
        update.deletedById = deletedById;
    }
    return model
        .findOneAndUpdate(filter, { $set: update }, { new: true, runValidators: true })
        .exec();
}
//# sourceMappingURL=mongoose-schema.utils.js.map