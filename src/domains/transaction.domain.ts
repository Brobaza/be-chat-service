import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

@Injectable()
export class TransactionDomain {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async startTransaction<T>(fn: (session: ClientSession) => Promise<T>) {
    if (typeof fn !== 'function') {
      throw new TypeError('fn must be a function');
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
