import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseFindAndCountRequest {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  q?: string;

  @Transform(({ obj }) => (obj.page - 1) * obj.limit || 0, { toClassOnly: true })
  get offset(): number {
    return (this.page - 1) * this.limit || 0;
  }
}
