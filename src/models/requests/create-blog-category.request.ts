import { IsSlug } from '@/validations/is-slug.validation';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBlogCategoryRequest {
  @ApiProperty({ example: 'News' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'news' })
  @IsSlug()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'https://example.com/image.png' })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({ example: 'Pro Smartphone' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: '81bc6f83-f5c9-47de-89c3-d0ddd31d0a28' })
  @IsUUID()
  @IsOptional()
  parentId: string;
}
