import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadEmojiRequest {
  @ApiProperty({ example: '😀' })
  @IsString()
  @IsNotEmpty()
  emoji: string;

  @ApiProperty({ example: 'RDBrV3EQHxB1byrBnwSeLTWHKIam' })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({ example: 'RDBrV3EQHxB1byrBnwSeLTWHKIam' })
  @IsString()
  @IsNotEmpty()
  messageId: string;
}
