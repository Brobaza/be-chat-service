import { BaseServiceAbstract } from '@/base/abstract-service.base';
import { Notification } from '@/models/schema/notification.schema';
import { NotificationsRepository } from '@/repo/notification.repo';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService extends BaseServiceAbstract<Notification> {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notifications_repository: NotificationsRepository,
  ) {
    super(notifications_repository);
  }
}
