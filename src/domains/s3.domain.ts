import { S3BucketType } from '@/enums/s3.enum';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { head, replace, split } from 'lodash';
import { fromBuffer } from 'file-type';

@Injectable()
export class S3Domain implements OnModuleInit {
  private s3Client: S3Client;
  private urlImageTemplate: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('aws.region'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('aws.accessKeyId'),
        secretAccessKey: this.configService.getOrThrow('aws.secretAccessKey'),
      },
    });
    this.urlImageTemplate = this.configService.getOrThrow('aws.s3.url');
  }

  async upload(
    userId: string,
    file: Buffer,
    type: S3BucketType,
    fileName: string,
  ) {
    const { mime, ext } = await fromBuffer(file);

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-');

    const s3Key = `${sanitizedFileName}_${ext}_${type}$${Date.now()}`;
    const result = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow('aws.s3.bucket'),
        Key: s3Key,
        Body: file,
        ContentType: mime,
      }),
    );

    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error('Failed to upload file to s3');
    }

    return replace(this.urlImageTemplate, 'IMAGE_VALUE', s3Key);
  }

  getUrlName(url: string) {
    const metadata = split(
      replace(url, replace(this.urlImageTemplate, 'IMAGE_VALUE', ''), ''),
      '_',
    );
    return {
      name: replace(head(metadata), '-', '_'),
      type: replace(metadata[1], '-', '/'),
    };
  }
}
