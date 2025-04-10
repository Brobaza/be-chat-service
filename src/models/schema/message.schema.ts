import { BaseEntity } from '@/base/entity.base';
import { MessageType } from '@/enums/message-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Emoji } from './emoji.schema';
import { User } from './user.schema';

export type MessageDocument = HydratedDocument<Message>;

export interface IMention {
  userId: string;
  displayName: string;
  startIndex: number;
  endIndex: number;
}

@Schema({ timestamps: true })
export class Message extends BaseEntity {
  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ enum: MessageType, default: MessageType.TEXT })
  contentType: MessageType;

  @Prop({
    type: [
      {
        userId: String,
        displayName: String,
        startIndex: Number,
        endIndex: Number,
      },
    ],
    default: [],
  })
  mentions: {
    userId: string;
    displayName: string;
    startIndex: number;
    endIndex: number;
  }[];

  @Prop({
    type: [
      {
        url: String,
        thumbnailImage: String,
        startIndex: Number,
        endIndex: Number,
        description: String,
        title: String,
      },
    ],
    default: [],
  })
  previewUrl: {
    url: string;
    thumbnailImage: string;
    startIndex: number;
    endIndex: number;
    description: string;
    title: string;
  }[];

  @Prop({
    type: {
      messageId: String,
      body: String,
      senderName: String,
      isImage: Boolean,
    },
    default: null,
    required: false,
  })
  replyInfo: {
    messageId: string;
    body: string;
    senderName: string;
    isImage: boolean;
  };

  @Prop({ types: [{ type: Types.ObjectId }], ref: 'Emoji', default: [] })
  emojis: Emoji[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
