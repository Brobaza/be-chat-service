import { CurrentUserId } from '@/decorators';
import { S3Domain } from '@/domains/s3.domain';
import { S3BucketType } from '@/enums/s3.enum';
import { JwtAccessTokenGuard } from '@/guards';
import { CustomThrottlerGuard } from '@/guards/custom-throttler.guard';
import { UploadFileResponse } from '@/models/responses/upload-file.resp';
import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Controller({
  version: '1',
  path: 'file',
})
@UseGuards(JwtAccessTokenGuard)
export class FileController {
  constructor(private readonly s3Domain: S3Domain) {}

  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @ApiOkResponse({
    type: () => UploadFileResponse,
  })
  @ApiConsumes('multipart/form-data')
  @Post('/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUserId() userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1000 }),
          new FileTypeValidator({
            fileType: 'image/jpeg',
          }),
        ],
      }),
    )
    file,
    @Body('type') type: S3BucketType,
    @Body('fileName') fileName: string,
  ) {
    const result = await this.s3Domain.upload(
      userId,
      file.buffer,
      type,
      fileName,
    );
    return {
      url: result,
    };
  }
}
