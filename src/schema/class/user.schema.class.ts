import dayjs from "dayjs";
import { HydratedDocument } from "mongoose";
import { AccessType } from "src/enums/access_type";
import { RecordId } from "src/types/types";

export enum UserStatus {}


export class NonDocumentUser {
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
    // myEstates?: string[];
    // joinedEstates?: string[];
    selfiePhotoId?: RecordId;
    faceImageId?: string;
    selfiePhotoUrl?: string;
    faceImageUrl?: string;
    /** Set to true when user completes identity verification (e.g. BVN/NIN with selfie). */
    hasVerifiedIdentity?: boolean;
    /** When identity was first verified. */
    identityVerifiedAt?: ReturnType<typeof dayjs> | string;
    // notificationPreferences?: NotificationPreferences;
    createdAt?: ReturnType<typeof dayjs> | string;
    updatedAt?: ReturnType<typeof dayjs> | string;
    deletedAt?: ReturnType<typeof dayjs> | string;
}


// export class NonDocumenUser {
//   firstName: string;
//   lastName: string;
//   sex: string;
//   dob: Date;
// userName?: string;
//   email: string;
//   phone: string;
//   password: string;
//   state: string;
//   countryCode?: string;
//   createdAt?: Date;
//     userType?: AccessType;
//   permissions?: Permissions[];
//   // eslint-disable-next-line no-restricted-globals
//   updatedAt?: Date;
//   // eslint-disable-next-line no-restricted-globals
//   deletedAt?: Date;
// }

export type UserDocument = HydratedDocument<UserSchemaClass>;

export type User = Readonly<NonDocumentUser & { id: string }>;

export class UserSchemaClass extends NonDocumentUser {
  readonly id: string;
  // eslint-disable-next-line no-restricted-globals
//   createdAt?: Date;
//   // eslint-disable-next-line no-restricted-globals
//   updatedAt?: Date;
//   // eslint-disable-next-line no-restricted-globals
//   deletedAt?: Date;
  // eslint-disable-next-line no-restricted-globals
  createdBy?: Date;
  // eslint-disable-next-line no-restricted-globals
  updatedBy?: Date;
  // eslint-disable-next-line no-restricted-globals
  deletedBy?: Date;
}

export type CreateUserAttributes = NonDocumentUser & {
     id?: string;
  _id?: string;
  createdBy?: string,
};
