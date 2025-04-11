import { StreamDomain } from '@/domains/stream.domain';
import { ChatService } from '@/services/chat.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { forEach } from 'lodash';

@Controller({
  version: '1',
  path: 'chat',
})
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly streamDomain: StreamDomain,
  ) {}

  @Get('/stream/:id/update-all')
  @HttpCode(HttpStatus.OK)
  async updateAllStream(@Param('id') id: string) {
    const users = await this.chatService.findAllUsers(id);

    forEach(users.items, async (user) => {
      await this.streamDomain.createUser(user.id, {
        name: user.name,
        avatar: user.avatar,
      });
    });

    return {
      success: true,
    };
  }

  @Post('/media/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1000 * 1000 }),
          // new FileTypeValidator({
          //   fileType: '.(png|jpeg|jpg|webp)',
          // }),
        ],
      }),
    )
    file,
    @Req() req: Request,
  ) {
    console.log('file', file);

    const conversationId = req.headers['x-conversation-id'];
    const userId = req.headers['x-user-id'];
    const fileName = req.headers['x-file-name'];

    return await this.chatService.uploadImageToConversation(
      conversationId,
      userId,
      file.buffer,
      fileName,
    );
  }
}
