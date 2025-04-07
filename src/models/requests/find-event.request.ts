import { EventSortBy } from '@/enums/event-sort-by.enum';
import { OrderBy } from '@/enums/order-by.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BaseFindAndCountRequest } from './base-find-and-count.request';

export class FindEventRequest extends BaseFindAndCountRequest {
  @ApiPropertyOptional({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsOptional()
  categoryId: string;

  @ApiPropertyOptional({ enum: EventSortBy })
  @IsEnum(EventSortBy)
  @IsOptional()
  sortBy: EventSortBy;

  @ApiPropertyOptional({ enum: OrderBy })
  @IsEnum(OrderBy)
  @IsOptional()
  orderBy: OrderBy;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsOptional()
  isOrderable: boolean;
}
