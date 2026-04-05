import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  age?: number;
}
