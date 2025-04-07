import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseFindAndCountRequest } from './base-find-and-count.request';
import { DiscountStatus } from '@/enums/discount.enum';

export class DiscountAvailableUserRequest extends BaseFindAndCountRequest {
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
