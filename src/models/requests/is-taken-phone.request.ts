import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class IsTakenPhoneRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;
}
