import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateDailyEventDefaultSettingsRequest {
  @ApiProperty({ example: 2 })
  @Max(5)
  @Min(2)
  @IsNumber()
  @IsNotEmpty()
  minPointLength: number;

  @ApiProperty({ example: 4 })
  @Max(5)
  @Min(2)
  @IsNumber()
  @IsNotEmpty()
  maxPointLength: number;

  @ApiProperty({ example: 1 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  maxPointsPurchases: number;

  @ApiProperty({ example: 10000 })
  @Min(10000)
  @IsNumber()
  @IsNotEmpty()
  minPurchaseLimit: number;

  @ApiProperty({ example: 1000000 })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  reward2Digit: number;

  @ApiProperty({ example: 5000000 })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  reward3Digit: number;

  @ApiProperty({ example: 15000000 })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  reward4Digit: number;

  @ApiProperty({ example: 50000000 })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  reward5Digit: number;

  @ApiProperty({ example: 4000 })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  totalPoints: number;

  @ApiProperty({ example: 80 })
  @Max(100)
  @Min(50)
  @IsNumber()
  @IsNotEmpty()
  startRate: number;
}
