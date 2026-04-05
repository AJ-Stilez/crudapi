import dayjs from 'dayjs';
import { HydratedDocument } from 'mongoose';
import { AccessType } from 'src/enums/access_type';

export class NonDocumentAuth {
  userId: string;
  identifier: string;
  email?: string;
  phone?: string;
  password: string;
  // eslint-disable-next-line no-restricted-globals
  phoneConfirmedAt?: ReturnType<typeof dayjs>;
  // eslint-disable-next-line no-restricted-globals
  emailConfirmedAt?: ReturnType<typeof dayjs>;
  roles: string[];
  permissions: string[];
  userType?: AccessType;
}

export type Auth = Readonly<NonDocumentAuth>;

// a runtime class for loadClass
export class AuthSchemaClass extends NonDocumentAuth {
  readonly id: string;  // Mongoose will create this from _id
}

// export type AuthDocument = Auth & AuthSchemaClass;

// Document type: include Mongoose document properties
export type AuthDocument = HydratedDocument<AuthSchemaClass>;

export type CreateAuthAttributes = NonDocumentAuth & {
  id?: string;
  _id?: string;
};
