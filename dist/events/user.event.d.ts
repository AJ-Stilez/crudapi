import { AccessType } from 'src/enums/access_type';
import { RecordId } from 'src/types/types';
import { BaseEvent } from './base.events';
export type NewUserAuthCreated = {
    identifier: RecordId;
    userId: RecordId;
    email: string;
    phone: string;
    phoneConfirmedAt?: string | null;
    emailConfirmedAt?: string | null;
    password: string;
    roles?: string[] | [];
    permissions?: string[] | [];
    userType?: AccessType;
    firstName?: string;
};
export declare const NEW_USER_CREATED_FOR_AUTH = "new.user.created.for.auth";
export declare class NewUserCreatedEvent extends BaseEvent<NewUserAuthCreated> {
}
