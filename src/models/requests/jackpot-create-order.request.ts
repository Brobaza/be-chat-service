import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JackpotCreateOrderRequest {
  @ApiProperty({ type: () => [String], example: ['1234', '5678'] })
  @Length(1, 5, { each: true })
  @IsString({ each: true })
  @IsNotEmpty()
  points: string[];
}
