import { Document } from 'mongoose';
import { Permission } from 'src/enums/permissions.enum';
import { AccessType } from 'src/enums/access_type';
export declare class AuthUser extends Document {
    username: string;
    email: string;
    password: string;
    roles: AccessType[];
    permissions: Permission[];
}
export declare const AuthSchema: import("mongoose").Schema<AuthUser, import("mongoose").Model<AuthUser, any, any, any, Document<unknown, any, AuthUser, any, {}> & AuthUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuthUser, Document<unknown, {}, import("mongoose").FlatRecord<AuthUser>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuthUser> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
