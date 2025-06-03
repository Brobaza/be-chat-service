import { BaseEntity } from '@/base/entity.base';
import { NotificationType } from '@/enums/notification.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Notification extends BaseEntity {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
