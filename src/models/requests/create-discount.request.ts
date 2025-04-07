import { DiscountStatus } from '@/enums/discount.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDiscountRequest {
  @ApiProperty({
    example: 'SAVE20',
    description: 'Unique code for the discount',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(6)
  code: string;

  @ApiProperty({
    example: '02/01/2025 00:00:00',
  })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '02/05/2025 00:00:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: 'PUBLIC',
    enum: DiscountStatus,
  })
  @IsEnum(DiscountStatus)
  @IsString()
  @IsNotEmpty()
  visibility: DiscountStatus;

  @ApiProperty({ example: 20 })
  @Max(100)
  @Min(0)
  @IsNumber()
  @IsOptional()
  discountRate?: number;

  @ApiProperty({ example: 50000 })
  @Min(0)
  @IsNumber()
  @IsOptional()
  discount?: number;
}
