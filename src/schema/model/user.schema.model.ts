import { createSchema } from 'src/utils/mongoose-schema.utils';
import { UserSchemaClass } from 'src/schema/class/user.schema.class';
import * as _ from 'lodash';
import { isEmail } from 'class-validator';
import {
  MAX_LENGTH_EMAIL_ADDRESS_DB_VALIDATION,
  MAX_LENGTH_NAME_DB_VALIDATION,
  MAX_LENGTH_USERNAME_DB_VALIDATION,
  MIN_LENGTH_NAME_DB_VALIDATION,
  MIN_LENGTH_PASSWORD_DB_VALIDATION,
} from 'src/constants/user.constants';
import { Schema } from 'mongoose';
import dayjs from 'dayjs';

export const UserSchemaModel = createSchema(
  {
    firstName: {
      type: String,
      trim: true,
      minLength: [
        MIN_LENGTH_NAME_DB_VALIDATION,
        `The length of the first name must be a minimum of ${MIN_LENGTH_NAME_DB_VALIDATION} characters`,
      ],
      maxLength: [
        MAX_LENGTH_NAME_DB_VALIDATION,
        `The maximum length of the name must be ${MAX_LENGTH_NAME_DB_VALIDATION} characters`,
      ],
      required: [true, 'Please tell us your first name'],
      set: _.capitalize,
    },
    lastName: {
      type: String,
      trim: true,
      minlength: [
        MIN_LENGTH_NAME_DB_VALIDATION,
        `The length of the last name must be a minimum of ${MIN_LENGTH_NAME_DB_VALIDATION} characters`,
      ],
      maxLength: [
        MAX_LENGTH_NAME_DB_VALIDATION,
        `The maximum length of your last name must be ${MAX_LENGTH_NAME_DB_VALIDATION} characters`,
      ],
      required: [true, 'Please tell us your last name!'],
      set: _.capitalize,
    },
    email: {
      type: String,
      maxLength: [
        MAX_LENGTH_EMAIL_ADDRESS_DB_VALIDATION,
        `The email address must be a maximum of ${MAX_LENGTH_EMAIL_ADDRESS_DB_VALIDATION} characters`,
      ],
      validate: [isEmail, 'Please provide a valid email address'],
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
        MAX_LENGTH_USERNAME_DB_VALIDATION,
        `The username must be a maximum of ${MAX_LENGTH_USERNAME_DB_VALIDATION} characters`,
      ],
    },
    phoneConfirmedAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      default: () => dayjs().toDate(),
    },
    emailConfirmedAt: {
      // eslint-disable-next-line no-restricted-globals
      type: Date,
      default: () => dayjs().toDate(),
    },
    password: {
      type: String,
      minlength: [
        MIN_LENGTH_PASSWORD_DB_VALIDATION,
        `The length of the password must be a minimum of ${MIN_LENGTH_PASSWORD_DB_VALIDATION} characters`,
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
    // myEstates: [{ type: Schema.Types.ObjectId, ref: 'Estate' }],
    // joinedEstates: [{ type: Schema.Types.ObjectId, ref: 'Estate' }],
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
      // eslint-disable-next-line no-restricted-globals
      type: Date,
    },
    // notificationPreferences: {
    //   type: {
    //     paymentAlerts: {
    //       email: { type: Boolean, default: true },
    //       sms: { type: Boolean, default: true },
    //       push: { type: Boolean, default: false },
    //     },
    //     estateNotices: {
    //       email: { type: Boolean, default: true },
    //       sms: { type: Boolean, default: false },
    //       push: { type: Boolean, default: true },
    //     },
    //     systemAlerts: {
    //       email: { type: Boolean, default: true },
    //       sms: { type: Boolean, default: false },
    //       push: { type: Boolean, default: true },
    //     },
    //   },
    //   default: DEFAULT_NOTIFICATION_PREFERENCES,
    // },
  },
  {
    loadClass: UserSchemaClass,
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
  },
);
