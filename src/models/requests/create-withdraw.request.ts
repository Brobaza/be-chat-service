import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateWithdrawRequest {
  @ApiProperty({ example: 500000, description: 'Amount to withdraw (VND)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(10000, { message: 'Amount must be at least 10,000 VND' })
  amount: number;

  @ApiProperty({
    example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703',
    description: 'Account number for the transfer',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  toBankId: string;
}
