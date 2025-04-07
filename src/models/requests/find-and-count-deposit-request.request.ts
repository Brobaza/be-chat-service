import { DepositRequestCompletedType } from '@/enums/deposit-request-completed-type.enum';
import { DepositRequestStatus } from '@/enums/deposit-request-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAndCountRequest } from './base-find-and-count.request';

export class FindAndCountDepositRequest extends BaseFindAndCountRequest {
  @ApiPropertyOptional({
    enum: DepositRequestStatus,
  })
  @IsEnum(DepositRequestStatus)
  @IsOptional()
  status: DepositRequestStatus;

  @ApiPropertyOptional({
    enum: DepositRequestCompletedType,
  })
  @IsEnum(DepositRequestCompletedType)
  @IsOptional()
  completedType: DepositRequestCompletedType;
}
