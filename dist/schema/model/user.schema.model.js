"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchemaModel = void 0;
const mongoose_schema_utils_1 = require("../../utils/mongoose-schema.utils");
const user_schema_class_1 = require("../class/user.schema.class");
const _ = __importStar(require("lodash"));
const class_validator_1 = require("class-validator");
const user_constants_1 = require("../../constants/user.constants");
const dayjs_1 = __importDefault(require("dayjs"));
exports.UserSchemaModel = (0, mongoose_schema_utils_1.createSchema)({
    firstName: {
        type: String,
        trim: true,
        minLength: [
            user_constants_1.MIN_LENGTH_NAME_DB_VALIDATION,
            `The length of the first name must be a minimum of ${user_constants_1.MIN_LENGTH_NAME_DB_VALIDATION} characters`,
        ],
        maxLength: [
            user_constants_1.MAX_LENGTH_NAME_DB_VALIDATION,
            `The maximum length of the name must be ${user_constants_1.MAX_LENGTH_NAME_DB_VALIDATION} characters`,
        ],
        required: [true, 'Please tell us your first name'],
        set: _.capitalize,
    },
    lastName: {
        type: String,
        trim: true,
        minlength: [
            user_constants_1.MIN_LENGTH_NAME_DB_VALIDATION,
            `The length of the last name must be a minimum of ${user_constants_1.MIN_LENGTH_NAME_DB_VALIDATION} characters`,
        ],
        maxLength: [
            user_constants_1.MAX_LENGTH_NAME_DB_VALIDATION,
            `The maximum length of your last name must be ${user_constants_1.MAX_LENGTH_NAME_DB_VALIDATION} characters`,
        ],
        required: [true, 'Please tell us your last name!'],
        set: _.capitalize,
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
    countryCode: {
        type: String,
        trim: true,
        maxLength: [5, 'Country code must be a maximum of 5 characters'],
    },
    userName: {
        type: String,
        maxLength: [
            user_constants_1.MAX_LENGTH_USERNAME_DB_VALIDATION,
            `The username must be a maximum of ${user_constants_1.MAX_LENGTH_USERNAME_DB_VALIDATION} characters`,
        ],
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
    position: {
        type: String,
    },
    permissions: {
        type: [String],
        default: [],
    },
    selfiePhotoId: {
        type: String,
    },
    faceImageId: {
        type: String,
    },
    selfiePhotoUrl: {
        type: String,
    },
    faceImageUrl: {
        type: String,
    },
    hasVerifiedIdentity: {
        type: Boolean,
        default: false,
    },
    identityVerifiedAt: {
        type: Date,
    },
}, {
    loadClass: user_schema_class_1.UserSchemaClass,
    softDelete: true,
    auditFields: true,
    indexes: [
        { fields: { email: 1 }, options: { unique: true, sparse: true } },
        { fields: { phone: 1 }, options: { sparse: true } },
        { fields: { userName: 1 }, options: { sparse: true } },
        { fields: { userType: 1 } },
        { fields: { myEstates: 1 } },
        { fields: { joinedEstates: 1 } },
        { fields: { createdAt: -1 } },
    ],
});
//# sourceMappingURL=user.schema.model.js.map