import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UpdateJackpotDefaultSettingsRequest } from './update-jackpot-default-settings.request';

export class CreateJackpotRequest extends UpdateJackpotDefaultSettingsRequest {
  @ApiProperty({ example: '01/01/2025' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '01/04/2025 00:00:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '01/04/2025 19:00:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}
