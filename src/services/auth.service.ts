import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { RegisterRequest } from '@/models/requests/register.request';
import { RegisterResponse } from '@/models/responses/register.response';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { UsersService } from './user.service';
import { LoginRequest } from '@/models/requests/login.request';
import { LoginResponse } from '@/models/responses/login.response';
import { isEmpty } from 'lodash';
import { OK_RESPONSE } from '@/utils/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  async register(dto: RegisterRequest): Promise<RegisterResponse> {
    const { email } = dto;

    const isTakenEmail = await this.userService.isTakenEmail(email);
    if (isTakenEmail) {
      throw new ConflictException({
        code: ErrorDictionary.EMAIL_ALREADY_TAKEN,
      });
    }

    const { userId } = await this.userService.createUser(dto);

    const { accessExpiresAt, accessToken, refreshExpiresAt, refreshToken } =
      await this.sessionService.gen(userId);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  async login({ username, password }: LoginRequest): Promise<LoginResponse> {
    const user = await this.userService.getByUsername(username);

    if (isEmpty(user)) {
      throw new UnauthorizedException({
        code: ErrorDictionary.USERNAME_OR_PASSWORD_INCORRECT,
      });
    }

    const isPasswordCorrect = await this.userService.comparePassword(
      password,
      user,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException({
        code: ErrorDictionary.USERNAME_OR_PASSWORD_INCORRECT,
      });
    }

    const result = await this.sessionService.gen(user.id);

    return result;
  }

  async logout(userId: string, sessionId: string, token: string) {
    await this.sessionService.delete({ sessionId, userId, accessToken: token });
    return OK_RESPONSE;
  }
}
