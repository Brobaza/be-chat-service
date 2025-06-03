import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { Notification } from '@/models/schema/notification.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NotificationsRepository extends BaseRepositoryAbstract<Notification> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notifications_repository: Model<Notification>,
  ) {
    super(notifications_repository);
  }
}
