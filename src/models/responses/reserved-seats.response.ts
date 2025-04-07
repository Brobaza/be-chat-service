import { ApiProperty } from '@nestjs/swagger';

export class ReservedSeatsResponse {
  @ApiProperty({ type: [String], example: ['123', '1234', '12345'] })
  items: string[];

  @ApiProperty({ example: 3 })
  total: number;
}
