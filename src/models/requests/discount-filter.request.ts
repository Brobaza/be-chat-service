import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseFindAndCountRequest } from './base-find-and-count.request';
import { DiscountStatus } from '@/enums/discount.enum';

export class DiscountFilterRequest extends BaseFindAndCountRequest {
  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '20/02/2025 00:00:00',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '02/05/2025 00:00:00',
  })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Visibility for filtering',
    example: 'PUBLIC',
    enum: DiscountStatus,
    enumName: 'DiscountStatus',
  })
  @IsString()
  @IsOptional()
  @IsEnum(DiscountStatus)
  @IsOptional()
  visibility?: DiscountStatus;
}
