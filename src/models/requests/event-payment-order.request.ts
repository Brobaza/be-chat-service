import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IdRequest } from './id.request';

export class EventPaymentOrderRequest extends IdRequest {
  @ApiProperty({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}
