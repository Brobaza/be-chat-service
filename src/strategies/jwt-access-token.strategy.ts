import { ACCESS_TOKEN_PUBLIC_KEY } from '@/constraints/jwt.constraint';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { Role } from '@/enums/role.enum';
import { SessionType } from '@/enums/session-type.enum';
import { AppRequest } from '@/models/interfaces/app-request.interface';
import { TokenPayload } from '@/models/interfaces/token-payload.interface';
import { UsersRepository } from '@/repo/user.repo';
import { SessionService } from '@/services/session.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: ACCESS_TOKEN_PUBLIC_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req: AppRequest, { id }: TokenPayload) {
    const { sessionId, userId } = await this.sessionService.verifySession(
      id,
      SessionType.ACCESS,
    );

    if (req.adminRoute || !req.skipVerification) {
      const user = await this.userRepository.findOneById(userId);

      if (req.adminRoute) {
        if (user.role !== Role.ADMIN) {
          throw new ForbiddenException({
            code: ErrorDictionary.FORBIDDEN,
          });
        }
      }
    }

    req.currentUserId = userId;
    req.currentSessionId = sessionId;

    return true;
  }
}
