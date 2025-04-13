import { StreamDomain } from '@/domains/stream.domain';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { MessageType } from '@/enums/message-type.enum';
import { SocketNamespace } from '@/enums/socket-namespace.enum';
import { CustomSocket } from '@/models/interfaces/socket.interface';
import { CreateMeetingRequest } from '@/models/requests/create-call.request';
import { SentMessageRequest } from '@/models/requests/sent-message.request';
import { UploadEmojiRequest } from '@/models/requests/upload-emoji.request';
import { UploadMessageRequest } from '@/models/requests/upload-message.request';
import { ChatService } from '@/services/chat.service';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { forEach, get, includes, isNil, map, trim } from 'lodash';
import { Server } from 'socket.io';
import { v4 } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
  namespace: SocketNamespace.CHAT,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private CHANNEL: string = 'general';

  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly streamDomain: StreamDomain,
  ) {}

  getServer() {
    return this.server;
  }

  async handleConnection(client: CustomSocket) {
    const { handshake } = client;
    const { currentUserId } = handshake;

    const { items: allConservation } =
      await this.chatService.getAllRelatedConservation(currentUserId);

    forEach(allConservation, (conversation) => {
      client.join(conversation.id.toString());
    });

    client.join(this.CHANNEL);
  }

  handleDisconnect(client: CustomSocket) {
    client.leave(this.CHANNEL);
  }

  @SubscribeMessage('end-meeting')
  async handleEndMeeting(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() body: CreateMeetingRequest,
  ) {
    const { conversationId, callType } = body;

    const metadata = await this.chatService.endMeeting(
      client.handshake.currentUserId,
      conversationId,
      callType,
    );

    if (isNil(metadata)) {
      client.emit('errors', { message: ErrorDictionary.BAD_REQUEST });

      return;
    }

    const { body: bodyMessage, messageId } = metadata;

    this.server.to(conversationId).emit('messages', {
      content: bodyMessage,
      sender: client.handshake.currentUserId,
      conversationId,
      type: MessageType.NOTI,
      messageId,
    });
  }

  @SubscribeMessage('create-meeting')
  async handleCreateMeeting(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() body: CreateMeetingRequest,
  ) {
    const { conversationId, callType } = body;

    const metadata = await this.chatService.startMeeting(
      client.handshake.currentUserId,
      conversationId,
      callType,
    );

    if (isNil(metadata)) {
      client.emit('errors', { message: ErrorDictionary.BAD_REQUEST });

      return;
    }

    const { body: bodyMessage, messageId, messageType } = metadata;

    this.server.to(conversationId).emit('messages', {
      content: bodyMessage,
      sender: client.handshake.currentUserId,
      conversationId,
      type: messageType,
      messageId,
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody()
    body: SentMessageRequest,
  ) {
    const { content, conversationId, mentions } = body;

    const trimmedContent = trim(content);

    const { messageId } = await this.chatService.sendMessageToConversation(
      conversationId,
      client.handshake.currentUserId,
      { message: trimmedContent },
      MessageType.TEXT,
      mentions,
      get(body, 'replyInfo', null),
    );

    if (!trimmedContent) {
      client.emit('errors', { message: ErrorDictionary.BAD_REQUEST });

      return;
    }

    this.server.to(conversationId).emit('messages', {
      content: trimmedContent,
      sender: client.handshake.currentUserId,
      conversationId,
      mentions: map(mentions, (mention) => ({ ...mention, id: v4() })),
      messageId,
      replyInfo: get(body, 'replyInfo', null),
    });
  }

  @SubscribeMessage('send-emoji')
  async handleSendEmoji(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() { emoji, conversationId, messageId }: UploadEmojiRequest,
  ) {
    const isNewEmoji = await this.chatService.sendEmojiToConversation(
      client.handshake.currentUserId,
      messageId,
      emoji,
    );

    this.server.to(conversationId).emit('receive-emoji', {
      content: isNewEmoji ? emoji : '',
      sender: client.handshake.currentUserId,
      messageId,
      conversationId,
    });
  }

  @OnEvent('conversation.send_message')
  handleSendMessageEvent(payload: {
    conversationId: string;
    userId: string;
    body: SentMessageRequest;
    type: MessageType;
    messageId: string;
  }) {
    this.server.to(payload.conversationId).emit('messages', {
      content: payload.body.content,
      sender: payload.userId,
      conversationId: payload.conversationId,
      type: payload.type,
      messageId: payload.messageId,
    });
  }

  @OnEvent('conversation.craw_url')
  handleCrawUrlEvent(payload: {
    conversationId: string;
    messageId: string;
    previewUrl: any;
  }) {
    this.server.to(payload.conversationId).emit('receive-craw-url', {
      messageId: payload.messageId,
      previewUrl: payload.previewUrl,
      conversationId: payload.conversationId,
    });
  }

  @OnEvent('conversation.delete_message')
  async handleDeleteMessageEvent(payload: {
    conversationId: string;
    messageId: string;
    userId: string;
  }) {
    const { conversationId, messageId } = payload;

    this.server.to(conversationId).emit('delete-message', {
      messageId,
      conversationId,
    });
  }

  @OnEvent('conversation.new')
  handleNewConversationEvent(payload: {
    conversationId: string;
    userId: string;
    body: UploadMessageRequest;
  }) {
    let thisUserSocket: CustomSocket;
    const userIds = [payload.userId, ...payload.body.targetIds];
    const { conversationId } = payload;

    const socketIds = (this.server.sockets as any)?.keys();

    for (const socketId of socketIds) {
      const socket = (this.server.sockets as any)?.get(
        socketId,
      ) as CustomSocket;

      if (socket.handshake.currentUserId === payload.userId) {
        thisUserSocket = socket;
      }

      if (includes(userIds, socket.handshake.currentUserId)) {
        socket.join(conversationId);
      }
    }

    this.server.to(conversationId).emit('messages', {
      content: payload.body.message,
      sender: payload.userId,
      conversationId,
    });

    this.server.to(thisUserSocket.id).emit('redirect', {
      conversationId,
    });
  }
}
