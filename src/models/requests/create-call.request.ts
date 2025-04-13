import { CallType } from '@/enums/call-type.enum';
import { IsEnum, IsString } from 'class-validator';

export class CreateMeetingRequest {
  @IsString()
  conversationId: string;

  @IsEnum([...Object.values(CallType)])
  callType: CallType;
}
