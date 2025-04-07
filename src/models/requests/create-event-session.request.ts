import { IsSlug } from '@/validations/is-slug.validation';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateEventSessionRequest {
  @ApiProperty({ example: 'Event Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'event-1' })
  @IsSlug()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 100 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 1000 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  totalPoint: number;

  @ApiProperty({ example: 80.5 })
  @Min(1)
  @Max(100)
  @IsNotEmpty()
  startRate: number;

  @ApiProperty({ example: '02/01/2025 00:00:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '02/05/2025 00:00:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: '4510c78a-2d61-41b5-93e3-d43a2422f3d8' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @Min(2)
  @IsNumber()
  @IsNotEmpty()
  minPointLength: number;

  @ApiProperty({ example: 6 })
  @Max(6)
  @IsNumber()
  @IsNotEmpty()
  maxPointLength: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  reward: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  cashReward: number;
}
