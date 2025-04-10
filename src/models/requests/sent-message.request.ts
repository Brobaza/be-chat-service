import { IsNotEmpty, IsString } from 'class-validator';
import { IMention } from '../schema/message.schema';

export class SentMessageRequest {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  conversationId: string;

  mentions?: IMention[];

  replyInfo?: {
    messageId: string;
    body: string;
    senderName: string;
    isImage: boolean;
  };
}
