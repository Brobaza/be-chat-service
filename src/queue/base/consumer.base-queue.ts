import { QueueTopic } from '@/enums/queue-topic.enum';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';
import { forEach } from 'lodash';
import { CrawUrlQueueService } from '../craw-url.queue';
import { SyncStreamUserQueueService } from '../sync-stream-user.queue';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafkaClient: Kafka;
  private consumers: Map<string | RegExp, Consumer> = new Map();
  logger = new Logger(ConsumerService.name);

  constructor(
    private readonly configService: ConfigService,

    // * Queue services
    private readonly crawUrlQueueService: CrawUrlQueueService,
    private readonly syncStreamUserQueueService: SyncStreamUserQueueService,
  ) {}

  async onModuleInit() {
    console.log(this.configService.get<string[]>('kafka'));

    this.kafkaClient = new Kafka({
      brokers: this.configService.get<string[]>('kafka.brokers'),
      clientId: this.configService.get<string>('kafka.groupId'),
    });

    await this.consume(
      {
        topics: [QueueTopic.WEB_CRAWLER_TOPIC, QueueTopic.SYNC_STREAM_USER],
        fromBeginning: true,
      },
      {
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
          try {
            const parsedMessage = JSON.parse(message.value.toString());
            this.logger.log('Parsed message: ', parsedMessage);

            switch (topic) {
              case QueueTopic.WEB_CRAWLER_TOPIC:
                await this.crawUrlQueueService.crawWebData(parsedMessage);
                break;
              case QueueTopic.SYNC_STREAM_USER:
                await this.syncStreamUserQueueService.syncStreamUser(
                  parsedMessage,
                );
                break;
              default:
                this.logger.warn(`Unknown topic: ${topic}`);
                break;
            }

            await this.commitOffset(topic, partition, message.offset);

            await heartbeat();
          } catch (error) {
            this.logger.error(
              `Error processing message: ${error.message}`,
              error.stack,
            );
          }
        },
      },
    );
  }

  async onModuleDestroy() {
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    console.log('run consumer', topic, config);

    forEach(topic.topics, async (topicName) => {
      const consumer = this.kafkaClient.consumer({
        groupId: this.configService.get<string>('kafka.groupId'),
      });

      await consumer.connect();
      await consumer.subscribe(topic);
      await consumer.run({
        ...config,
        autoCommit: false,
      });

      this.consumers.set(topicName, consumer);
    });
  }

  async commitOffset(topic: string, partition: number, offset: string) {
    const consumer = this.consumers.get(topic);
    if (!consumer) {
      throw new Error(`No consumer found for topic ${topic}`);
    }

    await consumer.commitOffsets([
      { topic, partition, offset: (Number(offset) + 1).toString() },
    ]);
  }
}
