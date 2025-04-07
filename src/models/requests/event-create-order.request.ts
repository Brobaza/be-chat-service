import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EventCreateOrderRequest {
  @ApiProperty({
    type: () => [String],
    example: ['1234', '5678'],
  })
  @IsString({ each: true })
  @IsNotEmpty()
  points: string[];
}
