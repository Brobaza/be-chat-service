import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UpdateDailyEventDefaultSettingsRequest } from './update-daily-event-default-settings.request';

export class CreateDailyEventRequest extends UpdateDailyEventDefaultSettingsRequest {
  @ApiProperty({ example: '10/01/2025' })
  @IsString()
  @IsNotEmpty()
  date: string;
}
