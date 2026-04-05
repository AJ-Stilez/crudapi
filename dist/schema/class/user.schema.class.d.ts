import dayjs from "dayjs";
import { HydratedDocument } from "mongoose";
import { AccessType } from "src/enums/access_type";
import { RecordId } from "src/types/types";
export declare enum UserStatus {
}
export declare class NonDocumentUser {
    firstName: string;
    lastName: string;
    userName?: string;
    email: string;
    phone: string;
    countryCode?: string;
    password: string;
    phoneConfirmedAt?: ReturnType<typeof dayjs> | string;
    emailConfirmedAt?: ReturnType<typeof dayjs> | string;
    roles?: string[];
    position?: string;
    permissions?: string[];
    userType?: AccessType;
    selfiePhotoId?: RecordId;
    faceImageId?: string;
    selfiePhotoUrl?: string;
    faceImageUrl?: string;
    hasVerifiedIdentity?: boolean;
    identityVerifiedAt?: ReturnType<typeof dayjs> | string;
    createdAt?: ReturnType<typeof dayjs> | string;
    updatedAt?: ReturnType<typeof dayjs> | string;
    deletedAt?: ReturnType<typeof dayjs> | string;
}
export type UserDocument = HydratedDocument<UserSchemaClass>;
export type User = Readonly<NonDocumentUser & {
    id: string;
}>;
export declare class UserSchemaClass extends NonDocumentUser {
    readonly id: string;
    createdBy?: Date;
    updatedBy?: Date;
    deletedBy?: Date;
}
export type CreateUserAttributes = NonDocumentUser & {
    id?: string;
    _id?: string;
    createdBy?: string;
};
