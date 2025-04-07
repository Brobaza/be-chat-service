import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponse {
  @ApiProperty({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  url: string;
}
