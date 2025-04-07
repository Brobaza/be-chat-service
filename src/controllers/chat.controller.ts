import { ChatService } from '@/services/chat.service';
import {
  Controller,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller({
  version: '1',
  path: 'chat',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
