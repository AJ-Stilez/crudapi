import { UserSchemaClass } from 'src/schema/class/user.schema.class';
import { Schema } from 'mongoose';
export declare const UserSchemaModel: Schema<UserSchemaClass, import("mongoose").Model<UserSchemaClass, any, any, any, import("mongoose").Document<unknown, any, UserSchemaClass, any, {}> & UserSchemaClass & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserSchemaClass, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<UserSchemaClass>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<UserSchemaClass> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
