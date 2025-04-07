import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JackpotCreateOrderRequest {
  @ApiProperty({ type: () => [String], example: ['123', '456'] })
  @Length(1, 5, { each: true })
  @IsString({ each: true })
  @IsNotEmpty()
  points: string[];
}
