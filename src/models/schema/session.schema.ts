import { BaseEntity } from '@/base/entity.base';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Session extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
