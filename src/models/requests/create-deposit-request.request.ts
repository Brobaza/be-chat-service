import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Min } from 'class-validator';

export class createdDepositRequestRequest {
  @ApiProperty({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsNotEmpty()
  bankAccount: string;

  @ApiProperty({ example: 10000 })
  @Min(10000)
  @IsNotEmpty()
  amount: number;
}
