import { Schema, SchemaDefinition, Model, FilterQuery } from 'mongoose';
import { ExtendedSchemaOptions } from 'src/types/mongoose.types';
export type FieldMap = Record<string, string>;
export declare function createSchema<T = any>(definition: SchemaDefinition<T>, options?: ExtendedSchemaOptions<T>): Schema<T>;
export declare function generateMongooseClass<T>(definition: SchemaDefinition<T>): new () => any;
export declare function softDelete<T>(model: Model<T>, filter: FilterQuery<T>, deletedById?: string): Promise<T | null>;
