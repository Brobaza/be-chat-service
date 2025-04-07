import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';
import { RedisIoAdapter } from './adapters/redis.adapter';
import { AppModule } from './app.module';
import { CacheDomain } from './domains';
import { CHAT_PROTO_SERVICE_PACKAGE_NAME } from './gen/chat.service';
import AppLoggerService from './libs/logger';

async function bootstrap() {
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(helmet());

  app.use(cookieParser());

  app.useLogger(app.get(AppLoggerService));

  app.setGlobalPrefix(configService.get<string>('prefix'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string>('version'),
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      protoPath: join(process.cwd(), 'proto/chat.service.proto'),
      package: CHAT_PROTO_SERVICE_PACKAGE_NAME,
      url: configService.get('grpcUrl'),
    },
  });

  const redisIoAdapter = new RedisIoAdapter(app, app.get(CacheDomain));
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = configService.get<number>('port');

  app.use(compression({ level: 6 }));

  await app.startAllMicroservices();

  await app.listen(port, () => {
    const logger: Logger = new Logger('Server connection');
    logger.log(
      `🥰 Chat service has started successfully running on port ${port}`,
    );
  });
}
bootstrap();
