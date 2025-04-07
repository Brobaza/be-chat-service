import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import {
  AddNewConversationRequest,
  AddNewConversationResponse,
  ChatServiceController,
  ChatServiceControllerMethods,
  ConversationDetailRequest,
  GetConversationDetailResponse,
  GetOnlineUsersResponse,
  GetRelatedConversationsResponse,
  UserIdRequest,
} from '@/gen/chat.service';
import { User } from '@/models/schema/user.schema';
import { trimObjectValues } from '@/pipes/trim-object-value.pipe';
import { ChatService } from '@/services/chat.service';
import { convertToConversation, convertToUser } from '@/utils/converter';
import { Controller, Logger } from '@nestjs/common';
import { get, map } from 'lodash';

@Controller()
@ChatServiceControllerMethods()
export class AppController implements ChatServiceController {
  logger = new Logger(AppController.name);

  constructor(private readonly chatService: ChatService) {}

  async getOnlineUsers(
    request: UserIdRequest,
  ): Promise<GetOnlineUsersResponse> {
    try {
      const { userId } = request;
      this.logger.log(`Fetching online users for userId: ${userId}`);
      const users = await this.chatService.findAllUsers(userId);

      const trimmedUsers: User[] = trimObjectValues(users.items, {
        exclude: ['password'],
        omitEmpty: true,
        excludePrefix: ['_'],
        exposeEmptyArray: true,
      });

      return {
        onlineUsers: map(trimmedUsers, (user) => convertToUser(user)),
        total: users.count,
        metadata: {
          code: '200',
          message: 'OK',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error('Error in getOnlineUsers', error);

      return {
        onlineUsers: [],
        total: 0,
        metadata: {
          code: JSON.stringify(get(error, 'response.status', '500')),
          message: get(
            error,
            'response.code',
            ErrorDictionary.INTERNAL_SERVER_ERROR,
          ),
          errMessage: error.message,
        },
      };
    }
  }

  async getRelatedConversations(
    request: UserIdRequest,
  ): Promise<GetRelatedConversationsResponse> {
    try {
      const { userId } = request;
      const conversations =
        await this.chatService.getAllRelatedConservation(userId);

      return {
        conversation: map(conversations.items, (conversation) =>
          convertToConversation(conversation),
        ),
        total: conversations.count,
        metadata: {
          code: '200',
          message: 'OK',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error('Error in getRelatedConversations', error);

      return {
        conversation: [],
        total: 0,
        metadata: {
          code: JSON.stringify(get(error, 'response.status', '500')),
          message: get(
            error,
            'response.code',
            ErrorDictionary.INTERNAL_SERVER_ERROR,
          ),
          errMessage: error.message,
        },
      };
    }
  }

  async getConversationDetail(
    request: ConversationDetailRequest,
  ): Promise<GetConversationDetailResponse> {
    try {
      const { conversationId, userId } = request;
      this.logger.log(
        `Fetching conversation detail for conversationId: ${conversationId}, userId: ${userId}`,
      );
      const conversation = await this.chatService.getConversation(
        userId,
        conversationId,
      );

      return {
        data: convertToConversation(conversation),
        metadata: {
          code: '200',
          message: 'OK',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error('Error in getConversationDetail', error);

      return {
        data: undefined,
        metadata: {
          code: JSON.stringify(get(error, 'response.status', '500')),
          message: get(
            error,
            'response.code',
            ErrorDictionary.INTERNAL_SERVER_ERROR,
          ),
          errMessage: error.message,
        },
      };
    }
  }

  async addNewConversation(
    request: AddNewConversationRequest,
  ): Promise<AddNewConversationResponse> {
    try {
      const { userId, message, participants } = request;
      this.logger.log(
        `Adding new conversation for userId: ${userId}, message: ${message}, participants: ${participants}`,
      );
      const conversation = await this.chatService.createNewConversation(
        userId,
        {
          message,
          targetIds: participants,
        },
      );

      return {
        conversationId: conversation.conversationId,
        metadata: {
          code: '200',
          message: 'OK',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error('Error in addNewConversation', error);

      return {
        conversationId: '',
        metadata: {
          code: JSON.stringify(get(error, 'response.status', '500')),
          message: get(
            error,
            'response.code',
            ErrorDictionary.INTERNAL_SERVER_ERROR,
          ),
          errMessage: error.message,
        },
      };
    }
  }
}
