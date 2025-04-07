import { BaseEntity } from '@/base/entity.base';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Message } from './message.schema';
import { User } from './user.schema';

export type EmojiDocument = HydratedDocument<Emoji>;

@Schema({ timestamps: true })
export class Emoji extends BaseEntity {
  @Prop({ type: String, required: true })
  emoji: string;

  @Prop({ type: String, required: true })
  user: string;
}

export const EmojiSchema = SchemaFactory.createForClass(Emoji);
