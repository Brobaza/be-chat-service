import { BaseFindAndCountRequest } from './base-find-and-count.request';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WithdrawStatus } from '@/enums/withdraw-request.enum';
import { IsOptional } from 'class-validator';
import { Role } from '@/enums/role.enum';

export class FindAndCountWithDrawRequest extends BaseFindAndCountRequest {
  @ApiPropertyOptional({
    enum: WithdrawStatus,
    example: WithdrawStatus.APPROVED,
  })
  @IsOptional()
  status?: WithdrawStatus;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.ADMIN,
  })
  @IsOptional()
  role?: Role;
}
