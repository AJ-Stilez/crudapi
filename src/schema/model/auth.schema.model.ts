import { createSchema } from 'src/utils/mongoose-schema.utils';
import { Auth, AuthSchemaClass } from '../class/auth.schema.class';
import { MAX_LENGTH_EMAIL_ADDRESS_DB_VALIDATION, MIN_LENGTH_PASSWORD_DB_VALIDATION } from 'src/constants/user.constants';
import { isEmail } from 'class-validator';
import dayjs from 'dayjs';

export const AuthSchemaModel = createSchema<Auth>({
     userId: {
      type: String,
      required: [true, 'User ID is required'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    identifier: {
      type: String,
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
    permissions: {
      type: [String],
      default: [],
    },
},  {
    loadClass: AuthSchemaClass,
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
  },);
