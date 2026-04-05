import { IsArray, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";
import { MAX_LENGTH_PASSWORD_DB_VALIDATION, MIN_LENGTH_PASSWORD_DB_VALIDATION } from "src/constants/user.constants";

export class CreateUserValidator {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5, { message: 'Country code must be between 1 and 5 characters' })
  countryCode?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_LENGTH_PASSWORD_DB_VALIDATION)
  @MaxLength(MAX_LENGTH_PASSWORD_DB_VALIDATION)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password entered is weak',
  })
  password: string;

  @IsOptional()
  @IsString()
  tokenId?: string;

  @IsOptional()
  @IsString()
  code?: string;

  // Track who created the user
  @IsOptional()
  @IsString()
  createdBy?: string;
}