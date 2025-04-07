import { BaseServiceAbstract } from '@/base/abstract-service.base';
import { Message } from '@/models/schema/message.schema';
import { MessagesRepository } from '@/repo/message.repo';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class MessagesService extends BaseServiceAbstract<Message> {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly messages_repository: MessagesRepository,
    @InjectModel(Message.name)
    private readonly message_model: Model<Message>,
  ) {
    super(messages_repository);
  }

  async getMessagesByConversationId(
    conversationId: string,
  ): Promise<Message[]> {
    return this.message_model.find({ conversationId }).lean().exec();
  }

  async updateMessageByCrawUrl(
    messageId: string,
    crawUrl: any,
    maxRetries = 3,
    delayMs = 1000,
  ) {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.message_model.updateOne(
          { _id: new Types.ObjectId(messageId) },
          {
            $set: { previewUrl: crawUrl },
          },
        );
        return;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          this.logger.error(
            `Failed to update message after ${maxRetries} attempts: ${error.message}`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}
