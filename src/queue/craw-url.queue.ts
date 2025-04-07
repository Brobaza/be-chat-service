import { QueueTopic } from '@/enums/queue-topic.enum';
import { MessagesService } from '@/services/message.service';
import { handleCrawUrl } from '@/utils/helper';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { get } from 'lodash';
import { CacheDomain } from 'src/domains/cache.domain';
import { RedisKey } from 'src/enums/redis-key.enum';
import { ConsumerService } from './base/consumer.base-queue';

@Injectable()
export class WishlistQueueService implements OnModuleInit {
  logger = new Logger(WishlistQueueService.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly cacheDomain: CacheDomain,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageService: MessagesService,
  ) {}

  getCacheKey(): string {
    return RedisKey.WEB_CRAWLER;
  }

  async resetCache(key: string): Promise<void> {
    const ttl = await this.cacheDomain.getRedisClient().ttl(key);

    if (ttl === -1) {
      await this.cacheDomain.getRedisClient().expire(key, 60 * 60 * 2);
    }
  }

  async onModuleInit() {
    await this.consumerService.consume(
      {
        topics: [QueueTopic.WEB_CRAWLER_TOPIC],
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

            await this.crawWebData(parsedMessage);

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

  async crawWebData(parsedMessage: any) {
    const { conversationId, messageId, urls } = parsedMessage;
    this.logger.log(
      `Fetching data from URLs: ${urls} for conversationId: ${conversationId} in message ID: ${messageId}`,
    );

    const fetchedPreviewUrl = await Promise.all(
      (urls || [])?.map(
        async (item: { url: string; startIndex: number; endIndex: number }) => {
          const { url, startIndex, endIndex } = item;
          const data = await handleCrawUrl(url);
          return {
            url,
            thumbnailImage: get(data, 'images[0]', ''),
            startIndex,
            endIndex,
            description: get(data, 'description', ''),
            title: get(data, 'title', ''),
          };
        },
      ),
    );

    await this.messageService.updateMessageByCrawUrl(
      messageId,
      fetchedPreviewUrl,
    );

    this.logger.log(`Fetched data: ${JSON.stringify(fetchedPreviewUrl)}`);

    this.eventEmitter.emit('conversation.craw_url', {
      conversationId,
      messageId,
      previewUrl: fetchedPreviewUrl,
    });
  }
}
