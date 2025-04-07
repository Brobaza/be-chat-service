import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { Message } from '@/models/schema/message.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MessagesRepository extends BaseRepositoryAbstract<Message> {
  constructor(
    @InjectModel(Message.name)
    private readonly messages_repository: Model<Message>,
  ) {
    super(messages_repository);
  }
}
