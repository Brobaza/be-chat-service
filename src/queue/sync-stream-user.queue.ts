import { StreamDomain } from '@/domains/stream.domain';
import { Logger } from '@nestjs/common';
export class SyncStreamUserQueueService {
  logger = new Logger(SyncStreamUserQueueService.name);

  constructor(private readonly streamDomain: StreamDomain) {}

  async syncStreamUser(message: any) {
    const { userId, name, avatar } = message;
    this.logger.log(`Syncing stream user: ${userId}`);

    try {
      const user = await this.streamDomain.createUser(userId, { name, avatar });

      this.logger.log(`Generated token for user ${userId}: ${user}`);
    } catch (error) {
      this.logger.error(
        `Error syncing stream user: ${error.message}`,
        error.stack,
      );
    }
  }
}
