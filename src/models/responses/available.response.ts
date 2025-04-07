import { ApiProperty } from '@nestjs/swagger';

export class AvailableResponse {
  @ApiProperty()
  available: boolean;
}
