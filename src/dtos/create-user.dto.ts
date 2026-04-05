import { IsEmail, isEmail, IsString, MinLength } from "class-validator";

export class CreateAuthDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
    }
