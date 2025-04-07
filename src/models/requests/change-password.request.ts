import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordRequest {
  @ApiProperty({ example: '123123' })
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '234234' })
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
