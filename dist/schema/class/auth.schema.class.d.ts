import dayjs from 'dayjs';
import { HydratedDocument } from 'mongoose';
import { AccessType } from 'src/enums/access_type';
export declare class NonDocumentAuth {
    userId: string;
    identifier: string;
    email?: string;
    phone?: string;
    password: string;
    phoneConfirmedAt?: ReturnType<typeof dayjs>;
    emailConfirmedAt?: ReturnType<typeof dayjs>;
    roles: string[];
    permissions: string[];
    userType?: AccessType;
}
export type Auth = Readonly<NonDocumentAuth>;
export declare class AuthSchemaClass extends NonDocumentAuth {
    readonly id: string;
}
export type AuthDocument = HydratedDocument<AuthSchemaClass>;
export type CreateAuthAttributes = NonDocumentAuth & {
    id?: string;
    _id?: string;
};
