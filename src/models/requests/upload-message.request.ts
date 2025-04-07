import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UploadMessageRequest {
  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'RDBrV3EQHxB1byrBnwSeLTWHKIam' })
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  targetIds: string[];
}
