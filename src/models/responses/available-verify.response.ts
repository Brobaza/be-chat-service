import { ApiProperty } from '@nestjs/swagger';

export class AvailableVerifyResponse {
  @ApiProperty()
  available: boolean;
}
