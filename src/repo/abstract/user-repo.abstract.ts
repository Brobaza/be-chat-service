import { BaseRepositoryInterface } from '@/base/repository.base';
import { User } from '@/models/schema/user.schema';

export interface UserRepositoryInterface
  extends BaseRepositoryInterface<User> {}
