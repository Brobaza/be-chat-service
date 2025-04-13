import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';
import { join } from 'path';
import {
  MICROSERVICE_PACKAGE_NAME,
  MICROSERVICE_SERVICE_NAME,
} from './constraints/microservice.constraint';
import { AppController } from './controllers/app.controller';
import { ChatController } from './controllers/chat.controller';
import { FileController } from './controllers/file.controller';
import { TransactionDomain } from './domains';
import { CacheDomain } from './domains/cache.domain';
import { S3Domain } from './domains/s3.domain';
import { StreamDomain } from './domains/stream.domain';
import { ChatGateway } from './gateways/chat.gateway';
import { ClientNotificationsGateway } from './gateways/client-notifications.gateway';
import { AppClassSerializerInterceptor } from './interceptors/mongo-class-serializer.interceptor';
import { loadConfiguration } from './libs/config';
import AppLoggerService from './libs/logger';
import {
  Conversation,
  ConversationSchema,
} from './models/schema/conservation.schema';
import { Emoji, EmojiSchema } from './models/schema/emoji.schema';
import { Message, MessageSchema } from './models/schema/message.schema';
import { ConsumerService } from './queue/base/consumer.base-queue';
import { ProducerService } from './queue/base/producer.base-queue';
import { CrawUrlQueueService } from './queue/craw-url.queue';
import { ConversationsRepository } from './repo/conversation.repo';
import { MessagesRepository } from './repo/message.repo';
import { AppService } from './services/app.service';
import { ChatService } from './services/chat.service';
import { ConversationService } from './services/conversation.service';
import { MessagesService } from './services/message.service';
import { SyncStreamUserQueueService } from './queue/sync-stream-user.queue';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [() => loadConfiguration()],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { uri } = configService.get('mongo');
        return { uri };
      },
    }),

    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
      {
        name: Emoji.name,
        schema: EmojiSchema,
      },
    ]),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, database, password } = configService.get('redis');
        return {
          store: await redisStore({
            database,
            password,
            socket: { host, port },
          }),
        };
      },
    }),

    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: MICROSERVICE_SERVICE_NAME.USER_SERVICE,
        useFactory: async (configService: ConfigService) =>
          ({
            transport: Transport.GRPC,
            options: {
              protoPath: join(__dirname, '../proto/user.service.proto'),
              package: MICROSERVICE_PACKAGE_NAME.USER_SERVICE,
              url: `${configService.get<string>('services.user.container_name')}:${configService.get<string>('services.user.port')}`,
            },
          }) as any,
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: MICROSERVICE_SERVICE_NAME.AUTH_SERVICE,
        useFactory: async (configService: ConfigService) =>
          ({
            transport: Transport.GRPC,
            options: {
              protoPath: join(__dirname, '../proto/auth.service.proto'),
              package: MICROSERVICE_PACKAGE_NAME.AUTH_SERVICE,
              url: `${configService.get<string>('services.auth.container_name')}:${configService.get<string>('services.auth.port')}`,
            },
          }) as any,
        inject: [ConfigService],
      },
    ]),
    PassportModule.register({}),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60 * 1000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AppController, ChatController, FileController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AppClassSerializerInterceptor },

    // * apps
    AppService,
    AppLoggerService,

    // * domains
    CacheDomain,
    TransactionDomain,
    S3Domain,
    StreamDomain,

    // * services
    MessagesService,
    ConversationService,
    ChatService,

    // * repositories

    // * strategies

    // * gateway
    ChatGateway,
    ClientNotificationsGateway,
    ConversationsRepository,
    MessagesRepository,

    // * queue
    ConsumerService,
    ProducerService,
    CrawUrlQueueService,
    SyncStreamUserQueueService,
  ],
})
export class AppModule {}
