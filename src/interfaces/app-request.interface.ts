import { User } from '@/models/schema/user.schema';
import { Request } from 'express';
import { Session } from 'inspector/promises';

export interface AppRequest extends Request {
  currentUser: User;
  currentSession: Session;
  skipVerification: boolean;
  token?: string;
}
