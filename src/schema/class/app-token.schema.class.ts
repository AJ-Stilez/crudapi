import dayjs from 'dayjs';
import { Document } from 'mongoose';
import { AppTokenPurpose } from 'src/utils/app-token.utils';


export class NonDocumentAppToken {
  identifierId: string;
  identifierType: string;
  purpose?: AppTokenPurpose | string;
  code?: string;
  // eslint-disable-next-line no-restricted-globals
  expiresBy?: ReturnType<typeof dayjs>;
  token: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  // eslint-disable-next-line no-restricted-globals
  expiresAt?: ReturnType<typeof dayjs>;
  // eslint-disable-next-line no-restricted-globals
  lastUsedAt?: ReturnType<typeof dayjs>;
}

export interface AppToken extends Readonly<NonDocumentAppToken>, Document {}

export class AppTokenSchemaClass extends NonDocumentAppToken {
  readonly id: string;
}

export type AppTokenDocument = AppToken & AppTokenSchemaClass;

export type CreateAppTokenAttributes = NonDocumentAppToken & {
  id?: string;
  _id?: string;
};
