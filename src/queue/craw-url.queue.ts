import { MessagesService } from '@/services/message.service';
import { handleCrawUrl } from '@/utils/helper';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { get } from 'lodash';
import { CacheDomain } from 'src/domains/cache.domain';

@Injectable()
export class CrawUrlQueueService {
  logger = new Logger(CrawUrlQueueService.name);

  constructor(
    private readonly cacheDomain: CacheDomain,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageService: MessagesService,
  ) {}

  getCacheKey(url: string): string {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    return `preview:${hash}`;
  }

  async resetCache(key: string): Promise<void> {
    const ttl = await this.cacheDomain.getRedisClient().ttl(key);

    if (ttl === -1) {
      await this.cacheDomain.getRedisClient().expire(key, 60 * 60 * 2);
    }
  }

  async crawWebData(parsedMessage: any) {
    const { conversationId, messageId, urls } = parsedMessage;

    const fetchedPreviewUrl = await Promise.all(
      (urls || []).map(async ({ url, startIndex, endIndex }) => {
        const cacheKey = this.getCacheKey(url);
        let data: any;

        const cached = await this.cacheDomain.getRedisClient().get(cacheKey);
        if (!cached) {
          this.logger.log(`Cache miss for URL: ${url}`);
          data = await handleCrawUrl(url);

          await this.cacheDomain
            .getRedisClient()
            .set(cacheKey, JSON.stringify(data), 'EX', 3600);
        } else {
          this.logger.log(`Cache hit for URL: ${url}`);
          data = JSON.parse(cached);
        }

        return {
          url,
          thumbnailImage: get(data, 'images[0]', ''),
          startIndex,
          endIndex,
          description: get(data, 'description', ''),
          title: get(data, 'title', ''),
        };
      }),
    );

    await this.messageService.updateMessageByCrawUrl(
      messageId,
      fetchedPreviewUrl,
    );

    this.eventEmitter.emit('conversation.craw_url', {
      conversationId,
      messageId,
      previewUrl: fetchedPreviewUrl,
    });
  }
}
