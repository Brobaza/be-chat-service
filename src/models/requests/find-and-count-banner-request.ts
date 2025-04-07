import { IsNotEmpty } from 'class-validator';
import { BaseFindAndCountRequest } from './base-find-and-count.request';
import { ApiProperty } from '@nestjs/swagger';

export class FindAndCountBannerRequest extends BaseFindAndCountRequest {
  @ApiProperty({ example: 'HOME' })
  @IsNotEmpty()
  page_keyword?: string;
}
