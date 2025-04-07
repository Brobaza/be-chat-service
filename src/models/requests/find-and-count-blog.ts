import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFindAndCountRequest } from './base-find-and-count.request';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class BlogFindAndCountRequest extends BaseFindAndCountRequest {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isFeature?: boolean;
}
