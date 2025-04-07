import { MICROSERVICE_SERVICE_NAME } from '@/constraints/microservice.constraint';
import { TransactionDomain } from '@/domains';
import { S3Domain } from '@/domains/s3.domain';
import { ConservationType } from '@/enums/conservation-type.enum';
import { MessageType } from '@/enums/message-type.enum';
import { S3BucketType } from '@/enums/s3.enum';
import { USER_SERVICE_NAME, UserServiceClient } from '@/gen/user.service';
import { UploadMessageRequest } from '@/models/requests/upload-message.request';
import { ListResponse } from '@/models/responses/list.resp';
import { Conversation } from '@/models/schema/conservation.schema';
import { Emoji } from '@/models/schema/emoji.schema';
import { IMention, Message } from '@/models/schema/message.schema';
import { User } from '@/models/schema/user.schema';
import { trimObjectValues } from '@/pipes/trim-object-value.pipe';
import { convertToMessage } from '@/utils/converter';
import { handleCrawUrl } from '@/utils/helper';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { flatten, get, isEmpty, keyBy, map, size, some, uniq } from 'lodash';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService implements OnModuleInit {
  logger = new Logger(ChatService.name);
  private userDomain: UserServiceClient;

  constructor(
    @InjectModel(Conversation.name)
    private readonly conservation_model: Model<Conversation>,
    @InjectModel(Message.name)
    private readonly message_model: Model<Message>,
    private readonly transactionDomain: TransactionDomain,
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(Emoji.name)
    private readonly emoji_model: Model<Emoji>,
    private readonly s3Domain: S3Domain,

    @Inject(MICROSERVICE_SERVICE_NAME.USER_SERVICE)
    private readonly client: ClientGrpcProxy,
  ) {}

  onModuleInit() {
    this.userDomain =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async findAllUsers(userId: string): Promise<{
    items: User[];
    count: number;
  }> {
    const { friends, metadata } = await firstValueFrom(
      this.userDomain.getAllRelatedFriend({
        userId,
      }),
    );

    if (!isEmpty(metadata?.errMessage)) {
      this.logger.error('Error while getting friends', metadata.errMessage);

      throw new InternalServerErrorException({
        stats: get(metadata, 'code', 500),
        code: get(metadata, 'message', 'Error while getting friends'),
      });
    }

    return {
      items: trimObjectValues(friends),
      count: size(friends) - 1,
    };
  }

  async getConversation(userId: string, conversationId: string) {
    const entity = await this.conservation_model
      .findOne({
        _id: new Types.ObjectId(conversationId),
        participants: { $in: [userId] },
      })
      .populate([
        {
          path: 'messages',
          populate: {
            path: 'emojis',
            model: Emoji.name,
          },
        },
      ])
      .lean()
      .exec();

    const imageMessageCountAndValue = await this.message_model.aggregate([
      {
        $match: {
          _id: { $in: map(entity.messages, (message) => message._id) },
          contentType: MessageType.IMAGE,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          value: { $push: '$$ROOT' },
        },
      },
    ]);

    const linkPreviewCountAndValue = await this.message_model.aggregate([
      {
        $match: {
          _id: { $in: map(entity.messages, (message) => message._id) },
          'previewUrl.0': { $exists: true },
        },
      },
      {
        $unwind: '$previewUrl',
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          value: { $push: '$$ROOT' },
        },
      },
    ]);

    const participants = await Promise.all(
      map(entity.participants, async (id) => {
        return await firstValueFrom(this.userDomain.getUser({ id }));
      }),
    );

    return trimObjectValues({
      ...entity,
      _id: entity._id.toString(),
      participants,
      messages: entity.messages.map((m: Message) => {
        const { _id, ...rest } = m;
        return convertToMessage({
          ...rest,
          id: _id.toString(),
          senderId: m?.senderId.toString(),
        });
      }),
      id: entity._id.toString(),
      attachments: {
        total: get(imageMessageCountAndValue, '[0].count', 0),
        items: map(
          get(imageMessageCountAndValue, '[0].value', []),
          (message) => {
            const { _id, ...rest } = message;

            const { name, type } = this.s3Domain.getUrlName(
              get(message, 'body', ''),
            );

            return {
              ...rest,
              id: _id.toString(),
              preview: message.body,
              senderId: message.senderId.toString(),
              name,
              type,
            };
          },
        ),
      },
      links: {
        total: get(linkPreviewCountAndValue, '[0].count', 0),
        items: flatten(
          map(get(linkPreviewCountAndValue, '[0].value', []), (message) =>
            get(message, 'previewUrl', []),
          ),
        ),
      },
    });
  }

  async getAllRelatedConservation(
    userId: string,
  ): Promise<ListResponse<Conversation>> {
    const numberOfConversations = await this.conservation_model.countDocuments({
      participants: { $in: [userId] },
    });

    const conversations = await this.conservation_model
      .find({
        participants: { $in: [userId] },
      })
      .populate([
        {
          path: 'messages',
          populate: {
            path: 'emojis',
            model: Emoji.name,
          },
        },
      ])
      .sort({ lastActivity: -1 })
      .lean()
      .exec();

    const allUserIds = uniq(conversations.flatMap((c) => c.participants));

    const participants = await Promise.all(
      map(allUserIds, async (id) => {
        return await firstValueFrom(this.userDomain.getUser({ id }));
      }),
    );

    const userMap = keyBy(participants, 'id');

    return {
      items: conversations.map((entity) => ({
        ...entity,
        _id: entity._id.toString(),
        id: entity._id.toString(),
        participants: entity.participants
          .map((userId: string) => {
            const user = userMap[userId];
            if (!user) {
              this.logger.error(`User not found for ID: ${userId}`);

              throw new InternalServerErrorException({
                status: 400,
                code: 'User not found',
              });
            }

            return user;
          })
          .filter(Boolean),
        messages: entity.messages.map((m: Message) => {
          const { _id, ...rest } = m;
          return {
            ...rest,
            id: _id.toString(),
            senderId: m?.senderId.toString(),
          };
        }),
      })) as any,
      count: numberOfConversations,
    };
  }

  async findBaseOnEndpoint(endpoint: string, userId: string) {
    if (endpoint === 'contacts') {
      return await this.findAllUsers(userId);
    }

    if (endpoint === 'conversations') {
      return await this.getAllRelatedConservation(userId);
    }
  }

  async sendEmojiToConversation(
    userId: string,
    messageId: string,
    emoji: string,
  ) {
    let isNewEmoji = false;

    try {
      await this.transactionDomain.startTransaction?.(async (session) => {
        const isExist = await this.emoji_model.aggregate([
          {
            $match: {
              user: new Types.ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: 'messages',
              localField: '_id',
              foreignField: 'emojis',
              as: 'message',
            },
          },
          {
            $match: {
              'message._id': new Types.ObjectId(messageId),
            },
          },
        ]);

        isNewEmoji = isEmpty(isExist);

        if (!isEmpty(isExist)) {
          await this.emoji_model.deleteOne(
            { _id: new Types.ObjectId(isExist[0]._id.toString() as string) },
            { session },
          );
          await this.message_model.updateOne(
            { _id: new Types.ObjectId(messageId) },
            {
              $pull: {
                emojis: new Types.ObjectId(isExist[0]._id.toString() as string),
              },
            },
            { session },
          );

          return isExist[0]._id.toString();
        } else {
          const newEmoji = await this.emoji_model.create(
            [
              {
                user: new Types.ObjectId(userId),
                emoji: emoji,
              },
            ],
            { session },
          );

          const updateMessage = await this.message_model.updateOne(
            { _id: new Types.ObjectId(messageId) },
            { $push: { emojis: newEmoji[0]._id } },
            { session },
          );

          return updateMessage;
        }
      });

      return isNewEmoji;
    } catch (err) {
      this.logger.error('Error while sending emoji to conversation', err);

      return false;
    }
  }

  async sendMessageToConversation(
    conservationId: string,
    userId: string,
    body: { message: string },
    type: MessageType = MessageType.TEXT,
    mentions: IMention[] = [],
  ) {
    const { message } = body;

    const previewUrl =
      type == MessageType.TEXT ? this.extractUrlsWithIndices(message) : [];
    const fetchedPreviewUrl = await Promise.all(
      previewUrl.map(async (item) => {
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
      }),
    );

    const newMessage = await this.message_model.create([
      {
        senderId: userId,
        body: message,
        contentType: type,
        mentions: map(mentions, (mention) => {
          const { userId, displayName, startIndex, endIndex } = mention;
          return {
            userId: userId,
            displayName,
            startIndex,
            endIndex,
          };
        }),
        previewUrl: !isEmpty(fetchedPreviewUrl) ? fetchedPreviewUrl : [],
        emojis: [],
      },
    ]);

    await this.conservation_model.updateOne(
      { _id: new Types.ObjectId(conservationId) },
      {
        $push: { messages: newMessage[0]._id },
        $set: { lastActivity: new Date() },
      },
    );

    return {
      conversationId: conservationId,
      messageId: newMessage[0]._id.toString(),
    };
  }

  async createNewConversation(userId: string, body: UploadMessageRequest) {
    const { message, targetIds } = body;

    const isAllExist = Promise.all(
      map(targetIds, async (id) => {
        const user = await firstValueFrom(this.userDomain.getUser({ id }));
        return !isEmpty(user.id);
      }),
    );

    if (some(isAllExist, (exist) => !exist)) {
      throw new InternalServerErrorException({
        stats: 400,
        code: 'User not found',
      });
    }

    const isExist = await this.conservation_model.findOne({
      participants: {
        $size: targetIds.length + 1,
        $all: [userId, ...targetIds],
      },
    });

    if (isExist) {
      const { messageId, conversationId } =
        await this.sendMessageToConversation(
          isExist._id.toString(),
          userId,
          body,
        );

      this.eventEmitter.emit('conversation.send_message', {
        conversationId: isExist._id.toString(),
        userId,
        body,
        type: MessageType.TEXT,
        messageId,
      });

      return { conversationId };
    } else {
      let result = null;

      await this.transactionDomain.startTransaction?.(async (session) => {
        const newMessage = await this.message_model.create(
          [
            {
              senderId: userId,
              body: message,
              contentType: MessageType.TEXT,
            },
          ],
          { session },
        );

        const conversation = await this.conservation_model.create(
          [
            {
              participants: [userId, ...body.targetIds],
              type:
                size(body.targetIds) === 1
                  ? ConservationType.ONE_TO_ONE
                  : ConservationType.GROUP,
              messages: [newMessage[0]._id],
            },
          ],
          { session },
        );

        result = conversation[0].toObject()._id.toString();

        return conversation;
      });

      this.eventEmitter.emit('conversation.new', {
        conversationId: result,
        userId,
        body,
      });

      return { conversationId: result };
    }
  }

  async uploadImageToConversation(
    conversationId: string,
    userId: string,
    file: Buffer,
    fileName: string,
  ) {
    const urlImage = await this.s3Domain.upload(
      userId,
      file,
      S3BucketType.Message,
      fileName,
    );

    const { messageId } = await this.sendMessageToConversation(
      conversationId,
      userId,
      { message: urlImage },
      MessageType.IMAGE,
    );

    this.eventEmitter.emit('conversation.send_message', {
      conversationId,
      userId,
      body: { content: urlImage },
      type: MessageType.IMAGE,
      messageId,
    });

    return { success: true };
  }

  extractUrlsWithIndices(text: string) {
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    const matches = [...text.matchAll(urlRegex)];

    return matches.map((match) => ({
      url: match[0],
      startIndex: match.index ?? -1,
      endIndex: match.index !== undefined ? match.index + match[0].length : -1,
    }));
  }
}
