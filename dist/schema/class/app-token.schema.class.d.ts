import dayjs from 'dayjs';
import { Document } from 'mongoose';
import { AppTokenPurpose } from 'src/utils/app-token.utils';
export declare class NonDocumentAppToken {
    identifierId: string;
    identifierType: string;
    purpose?: AppTokenPurpose | string;
    code?: string;
    expiresBy?: ReturnType<typeof dayjs>;
    token: string;
    name: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
    expiresAt?: ReturnType<typeof dayjs>;
    lastUsedAt?: ReturnType<typeof dayjs>;
}
export interface AppToken extends Readonly<NonDocumentAppToken>, Document {
}
export declare class AppTokenSchemaClass extends NonDocumentAppToken {
    readonly id: string;
}
export type AppTokenDocument = AppToken & AppTokenSchemaClass;
export type CreateAppTokenAttributes = NonDocumentAppToken & {
    id?: string;
    _id?: string;
};
