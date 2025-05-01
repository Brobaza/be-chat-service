import { StreamDomain } from '@/domains/stream.domain';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SyncStreamUserQueueService {
  logger = new Logger(SyncStreamUserQueueService.name);

  constructor(private readonly streamDomain: StreamDomain) {}

  async syncStreamUser(message: any) {
    const { userId, name, avatar } = message;
    this.logger.log(`Syncing stream user: ${userId}`);

    const maxRetries = 3;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const user = await this.streamDomain.createUser(userId, {
          name,
          avatar,
        });
        this.logger.log(`Generated token for user ${userId}: ${user}`);
        break;
      } catch (error) {
        this.logger.error(
          `Attempt ${attempt} - Error syncing stream user: ${error.message}`,
          error.stack,
        );

        if (attempt < maxRetries) {
          this.logger.warn(`Retrying in ${delayMs}ms...`);
          await this.delay(delayMs);
        } else {
          this.logger.error(`Failed to sync after ${maxRetries} attempts.`);
        }
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
