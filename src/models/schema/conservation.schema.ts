import { BaseEntity } from '@/base/entity.base';
import { ConservationType } from '@/enums/conservation-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Message } from './message.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({
  timestamps: true,
})
export class Conversation extends BaseEntity {
  @Prop({ enum: ConservationType, required: true })
  type: ConservationType;

  @Prop({ type: [String], ref: User.name, required: true })
  participants: string[];

  @Prop({ type: [{ type: Types.ObjectId }], ref: Message.name, required: true })
  messages: Message[];

  @Prop({ type: Date, default: Date.now })
  lastActivity: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
