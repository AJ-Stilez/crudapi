import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission } from 'src/enums/permissions.enum';
import { AccessType } from 'src/enums/access_type';

@Schema({
  timestamps: true,
})
export class AuthUser extends Document {
  @Prop({
    required: true,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  // Add roles array, default is USER
  @Prop({ type: [String], enum: AccessType, default: [AccessType.USER] })
  roles: AccessType[];

  // Add roles array, default is USER
  @Prop({ type: [String], enum: Permission, default: [Permission.GET_USER] })
  permissions: Permission[];
}

export const AuthSchema = SchemaFactory.createForClass(AuthUser);
