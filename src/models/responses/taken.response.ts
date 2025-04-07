import { ApiProperty } from '@nestjs/swagger';

export class TakenResponse {
  @ApiProperty()
  taken: boolean;
}
