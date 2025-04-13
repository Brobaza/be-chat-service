import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class ConsumerService implements OnModuleDestroy {
  private kafkaClient: Kafka;
  private consumers: Map<string | RegExp, Consumer> = new Map();

  constructor(private readonly configService: ConfigService) {
    console.log(this.configService.get<string[]>('kafka'));

    this.kafkaClient = new Kafka({
      brokers: this.configService.get<string[]>('kafka.brokers'),
      clientId: this.configService.get<string>('kafka.groupId'),
    });
  }

  // async onModuleInit() {}

  async onModuleDestroy() {
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    console.log('run consumer', topic, config);

    const topicName = topic.topics[0];
    const consumer = this.kafkaClient.consumer({
      groupId: this.configService.get<string>('kafka.groupId'),
    });

    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run({
      ...config,
      autoCommit: false,
    });

    consumer.on('consumer.connect', () => {
      console.log(`Consumer connected to topic ${topicName}`);
    });

    consumer.on('consumer.disconnect', () => {
      console.warn(`Consumer disconnected from topic ${topicName}`);
    });

    this.consumers.set(topicName, consumer);
  }

  async commitOffset(topic: string, partition: number, offset: string) {
    const consumer = this.consumers.get(topic);
    if (!consumer) {
      throw new Error(`No consumer found for topic ${topic}`);
    }

    await consumer.commitOffsets([
      { topic, partition, offset: (Number(offset) + 1).toString() },
    ]);
  }
}
