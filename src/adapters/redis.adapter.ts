import { MICROSERVICE_SERVICE_NAME } from '@/constraints/microservice.constraint';
import { CacheDomain } from '@/domains';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { Role } from '@/enums/role.enum';
import { SocketNamespace } from '@/enums/socket-namespace.enum';
import { AUTH_SERVICE_NAME, AuthServiceClient } from '@/gen/auth.service';
import { USER_SERVICE_NAME, UserServiceClient } from '@/gen/user.service';
import { CustomSocket } from '@/models/interfaces/socket.interface';
import {
  HttpStatus,
  INestApplicationContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { NextFunction } from 'express';
import { get } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(
    private app: INestApplicationContext,
    private readonly cacheDomain: CacheDomain,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = this.cacheDomain.getRedisClient();
    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createTokenMiddleware(
    authDomain: AuthServiceClient,
    userDomain: UserServiceClient,
    role?: Role,
  ) {
    return async (socket: CustomSocket, next: NextFunction) => {
      const token = get(socket, 'handshake.query.token', '') as string;

      if (!token) {
        next(
          new UnauthorizedException({
            code: ErrorDictionary.UNAUTHORIZED,
            statusCode: HttpStatus.UNAUTHORIZED,
          }),
        );

        return;
      }

      try {
        const { data, metadata } = await firstValueFrom(
          authDomain.verifyAccessToken({ token }),
        );

        if (metadata.code !== '200') {
          this.logger.error(get(metadata, 'message', 'Unknown error'));

          next(
            new UnauthorizedException({
              code: ErrorDictionary.UNAUTHORIZED,
              statusCode: HttpStatus.UNAUTHORIZED,
            }),
          );

          return;
        }

        const { id: sessionId, decodedUserId: userId } = data;

        if (role) {
          const user = await firstValueFrom(userDomain.getUser({ id: userId }));
          if (!user.id) {
            next(
              new UnauthorizedException({
                code: ErrorDictionary.UNAUTHORIZED,
              }),
            );

            return;
          }

          if (user.role !== role) {
            next(
              new UnauthorizedException({
                code: ErrorDictionary.FORBIDDEN,
              }),
            );

            return;
          }
        }

        socket.handshake.currentSessionId = sessionId;
        socket.handshake.currentUserId = userId;
        socket.handshake.token = token;

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, options);

    const clientAuth: ClientGrpcProxy = this.app.get(
      MICROSERVICE_SERVICE_NAME.AUTH_SERVICE,
    );
    const authService: AuthServiceClient =
      clientAuth.getService<AuthServiceClient>(AUTH_SERVICE_NAME);

    const clientUser: ClientGrpcProxy = this.app.get(
      MICROSERVICE_SERVICE_NAME.USER_SERVICE,
    );
    const userService: UserServiceClient =
      clientUser.getService<UserServiceClient>(USER_SERVICE_NAME);

    server
      .of(SocketNamespace.CLIENT_NOTIFICATIONS)
      .use(this.createTokenMiddleware(authService, userService));

    server
      .of(SocketNamespace.CHAT)
      .use(this.createTokenMiddleware(authService, userService));

    server.adapter(this.adapterConstructor);

    return server;
  }
}
