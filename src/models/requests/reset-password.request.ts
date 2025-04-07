import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { VerifyRequest } from './verify.request';

export class ResetPasswordRequest extends VerifyRequest {
  @ApiProperty({ example: '123123' })
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;
}
