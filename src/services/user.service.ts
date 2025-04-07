import { BaseServiceAbstract } from '@/base/abstract-service.base';
import { RegisterRequest } from '@/models/requests/register.request';
import { User } from '@/models/schema/user.schema';
import { UsersRepository } from '@/repo/user.repo';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { filter, forEach, map, omit } from 'lodash';
import { avatarUrlDemo } from '@/utils/constants';

@Injectable()
export class UsersService extends BaseServiceAbstract<User> {
  constructor(
    private readonly users_repository: UsersRepository,
    @InjectModel(User.name)
    private readonly user_model: Model<User>,
  ) {
    super(users_repository);
  }

  async getById(id: string): Promise<Partial<User> | null> {
    const user = await this.user_model.findById(id).lean().exec();
    if (user) {
      return omit({ ...user, id: user._id.toString() }, '_id', '__v');
    }
    return null;
  }

  async isTakenEmail(email: string): Promise<{
    _id: ObjectId;
  }> {
    return this.user_model.exists({ email });
  }

  async createUser(dto: RegisterRequest): Promise<{ userId: string }> {
    const randomAvatarIndex = Math.floor(Math.random() * avatarUrlDemo.length);

    const { id } = await this.users_repository.create({
      ...dto,
      avatar: avatarUrlDemo[randomAvatarIndex],
    });

    return { userId: id };
  }

  async getByUsername(username: string): Promise<User> {
    return this.user_model
      .findOne({
        email: username,
      })
      .select('+password')
      .exec();
  }

  async comparePassword(password: string, user: User): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async findAllUsers(userId: string): Promise<{
    items: User[];
    count: number;
  }> {
    const { count, items } = await this.findAll();

    return {
      items: filter(
        map(items, (user) =>
          omit({ ...user, id: user._id.toString() }, '_id', '__v'),
        ) as User[],
        (user) => user.id !== userId,
      ),
      count,
    };
  }

  async checkIfUsersExist(userIds: string[]) {
    forEach(userIds, (userId) => {
      if (!Types.ObjectId.isValid(userId)) {
        throw new NotFoundException('User not found');
      }
    });

    const users = await this.user_model.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      throw new NotFoundException('User not found');
    }
  }
}
