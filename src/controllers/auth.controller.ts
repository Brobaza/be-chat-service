// import { CurrentSession, CurrentToken, CurrentUser } from '@/decorators';
// import { SessionType } from '@/enums/session-type.enum';
// import { JwtAccessTokenGuard } from '@/guards';
// import { LoginRequest } from '@/models/requests/login.request';
// import { RegisterRequest } from '@/models/requests/register.request';
// import { LoginResponse } from '@/models/responses/login.response';
// import { OkResponse } from '@/models/responses/ok.response';
// import { RegisterResponse } from '@/models/responses/register.response';
// import { AuthService } from '@/services/auth.service';
// import {
//   Body,
//   Controller,
//   HttpCode,
//   HttpStatus,
//   Post,
//   UseGuards,
// } from '@nestjs/common';
// import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

// @Controller({
//   version: '1',
//   path: 'auth',
// })
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @ApiOkResponse({ type: () => RegisterResponse })
//   @HttpCode(HttpStatus.OK)
//   @Post('/sign-up')
//   async register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
//     const result = await this.authService.register(dto);
//     return result;
//   }

//   @ApiOkResponse({ type: () => LoginResponse })
//   @HttpCode(HttpStatus.OK)
//   @Post('/sign-in')
//   async login(@Body() body: LoginRequest): Promise<LoginResponse> {
//     const result = await this.authService.login(body);
//     return result;
//   }

//   @ApiBearerAuth(SessionType.ACCESS)
//   @ApiOkResponse({ type: () => OkResponse })
//   @UseGuards(JwtAccessTokenGuard)
//   @HttpCode(HttpStatus.OK)
//   @Post('/sign-out')
//   async logout(
//     @CurrentUser() userId: string,
//     @CurrentSession() sessionId: string,
//     @CurrentToken() token: string,
//   ): Promise<OkResponse> {
//     const result = await this.authService.logout(userId, sessionId, token);
//     return result;
//   }
// }
