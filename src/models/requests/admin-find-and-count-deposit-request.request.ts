import { DepositRequestCompletedType } from '@/enums/deposit-request-completed-type.enum';
import { DepositRequestStatus } from '@/enums/deposit-request-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { FindAndCountDepositRequest } from './find-and-count-deposit-request.request';

export class AdminFindAndCountDepositRequest extends FindAndCountDepositRequest {
  @ApiPropertyOptional({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsNotEmpty()
  createdBy: string;

  @ApiPropertyOptional({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsNotEmpty()
  completedBy: string;

  @ApiPropertyOptional({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsNotEmpty()
  canceledBy: string;

  @ApiPropertyOptional({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsNotEmpty()
  bankAccount: string;

  @ApiPropertyOptional({ enum: DepositRequestCompletedType })
  @IsEnum(DepositRequestCompletedType)
  @IsOptional()
  completedType: DepositRequestCompletedType;

  @ApiPropertyOptional({ enum: DepositRequestStatus })
  @IsEnum(DepositRequestStatus)
  @IsOptional()
  status: DepositRequestStatus;
}
