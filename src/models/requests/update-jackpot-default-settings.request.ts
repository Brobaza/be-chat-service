import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateJackpotDefaultSettingsRequest {
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

  @ApiProperty({ example: 4000 })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  totalPoints: number;

  @ApiProperty({ example: 10000 })
  @Min(10000)
  @IsNumber()
  @IsNotEmpty()
  minPurchaseLimit: number;

  @ApiProperty({ example: 50000000 })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  reward: number;
}
