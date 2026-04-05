"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSchemaModel = void 0;
const mongoose_schema_utils_1 = require("../../utils/mongoose-schema.utils");
const auth_schema_class_1 = require("../class/auth.schema.class");
const user_constants_1 = require("../../constants/user.constants");
const class_validator_1 = require("class-validator");
const dayjs_1 = __importDefault(require("dayjs"));
exports.AuthSchemaModel = (0, mongoose_schema_utils_1.createSchema)({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
    },
    identifier: {
        type: String,
    },
    email: {
        type: String,
        maxLength: [
            user_constants_1.MAX_LENGTH_EMAIL_ADDRESS_DB_VALIDATION,
            `The email address must be a maximum of ${user_constants_1.MAX_LENGTH_EMAIL_ADDRESS_DB_VALIDATION} characters`,
        ],
        validate: [class_validator_1.isEmail, 'Please provide a valid email address'],
    },
    phone: {
        type: String,
    },
    phoneConfirmedAt: {
        type: Date,
        default: () => (0, dayjs_1.default)().toDate(),
    },
    emailConfirmedAt: {
        type: Date,
        default: () => (0, dayjs_1.default)().toDate(),
    },
    password: {
        type: String,
        minlength: [
            user_constants_1.MIN_LENGTH_PASSWORD_DB_VALIDATION,
            `The length of the password must be a minimum of ${user_constants_1.MIN_LENGTH_PASSWORD_DB_VALIDATION} characters`,
        ],
    },
    userType: {
        type: String,
    },
    roles: {
        type: [String],
        default: [],
    },
    permissions: {
        type: [String],
        default: [],
    },
}, {
    loadClass: auth_schema_class_1.AuthSchemaClass,
    softDelete: true,
    auditFields: true,
    indexes: [
        { fields: { userId: 1 } },
        { fields: { identifier: 1 }, options: { unique: true, sparse: true } },
        { fields: { email: 1 }, options: { unique: true, sparse: true } },
        { fields: { phone: 1 }, options: { sparse: true } },
        { fields: { userType: 1 } },
        { fields: { lastSignedInEstate: 1 } },
        { fields: { assignedEstates: 1 } },
        { fields: { createdAt: -1 } },
    ],
});
//# sourceMappingURL=auth.schema.model.js.map