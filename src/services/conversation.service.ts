import { BaseServiceAbstract } from '@/base/abstract-service.base';
import { Conversation } from '@/models/schema/conservation.schema';
import { ConversationsRepository } from '@/repo/conversation.repo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConversationService extends BaseServiceAbstract<Conversation> {
  constructor(
    private readonly conversations_repository: ConversationsRepository,
    @InjectModel(Conversation.name)
    private readonly conservation_model: Model<Conversation>,
  ) {
    super(conversations_repository);
  }

  async getConversationById(conversationId: string): Promise<Conversation> {
    return this.conversations_repository.findOneById(conversationId);
  }
}
