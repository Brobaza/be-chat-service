import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelWithdrawRequest {
  @ApiProperty({ example: 'Account details incorrect', required: false })
  @IsOptional()
  @IsString()
  cancelReason: string;
}
