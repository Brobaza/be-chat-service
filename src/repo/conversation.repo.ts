import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { Conversation } from '@/models/schema/conservation.schema';
import { Message } from '@/models/schema/message.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConversationsRepository extends BaseRepositoryAbstract<Conversation> {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversations_repository: Model<Conversation>,
  ) {
    super(conversations_repository);
  }
}
