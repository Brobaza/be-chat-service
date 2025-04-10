import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamClient } from '@stream-io/node-sdk';

@Injectable()
export class StreamDomain implements OnModuleInit {
  private streamClient: StreamClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.streamClient = new StreamClient(
      this.configService.get<string>('stream.api_key'),
      this.configService.get<string>('stream.secret_key'),
    );
  }

  genToken(userId: string) {
    return this.streamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: 3600,
      role: 'user',
    });
  }
}
