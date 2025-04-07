import { Role } from '@/enums/role.enum';
import { UserStatus } from '@/enums/user-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseFindAndCountRequest } from './base-find-and-count.request';

export class findUserRequest extends BaseFindAndCountRequest {
  @ApiPropertyOptional({ enum: Object.values(Role) })
  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @ApiPropertyOptional({ enum: Object.values(UserStatus) })
  @IsEnum(UserStatus)
  @IsOptional()
  status: UserStatus;
}
