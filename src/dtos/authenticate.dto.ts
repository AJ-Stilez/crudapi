import {
  IsEmail,
  isEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AccessType } from 'src/enums/access_type';

export class AuthenticateValidator {
  // @IsEmail()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(AccessType)
  userType: AccessType;

   @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsIn(['mobile', 'desktop', 'tablet', 'unknown'])
  deviceType?: 'mobile' | 'desktop' | 'tablet' | 'unknown';

  @IsOptional()
  @IsString()
  osVersion?: string;
}
