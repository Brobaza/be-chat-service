import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyRequest {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'RDBrV3EQHxB1byrBnwSeLTWHKIam' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
