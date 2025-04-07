import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
