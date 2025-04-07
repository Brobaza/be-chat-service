import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { User } from '@/models/schema/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepositoryInterface } from './abstract/user-repo.abstract';

@Injectable()
export class UsersRepository
  extends BaseRepositoryAbstract<User>
  implements UserRepositoryInterface
{
  constructor(
    @InjectModel(User.name)
    private readonly users_repository: Model<User>,
  ) {
    super(users_repository);
  }
}
