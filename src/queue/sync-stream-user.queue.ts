import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './base/consumer.base-queue';
import { StreamDomain } from '@/domains/stream.domain';
import { QueueTopic } from '@/enums/queue-topic.enum';

@Injectable()
export class SyncStreamUserQueueService implements OnModuleInit {
  logger = new Logger(SyncStreamUserQueueService.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly streamDomain: StreamDomain,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume(
      {
        topics: [QueueTopic.SYNC_STREAM_USER],
        fromBeginning: true,
      },
      {
        eachMessage: async ({
          topic,
          partition,
          message,
          heartbeat,
          pause,
        }) => {
          try {
            const parsedMessage = JSON.parse(message.value.toString());
            this.logger.log('Parsed message: ', parsedMessage);

            await this.syncStreamUser(parsedMessage);

            await this.consumerService.commitOffset(
              topic,
              partition,
              message.offset,
            );

            await heartbeat();
          } catch (error) {
            this.logger.error(
              `Error processing message: ${error.message}`,
              error.stack,
            );
            pause();
          }
        },
      },
    );
  }

  async syncStreamUser(message: any) {
    const { userId, name, avatar } = message;
    this.logger.log(`Syncing stream user: ${userId}`);

    try {
      const user = this.streamDomain.createUser(userId, { name, avatar });

      this.logger.log(`Generated token for user ${userId}: ${user}`);
    } catch (error) {
      this.logger.error(
        `Error syncing stream user: ${error.message}`,
        error.stack,
      );
    }
  }
}
