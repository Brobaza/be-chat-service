import { IsSlug } from '@/validations/is-slug.validation';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBlogRequest {
  @ApiProperty({ example: 'Blog name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://example.com/image.png' })
  @IsString()
  @IsOptional()
  thumbnail: string;

  @ApiProperty({ example: 'blog description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'blog content' })
  @IsString()
  @IsOptional()
  content: string;

  @ApiProperty({ example: '4510c78a-2d61-41b5-93e3-d43a2422f3d8' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'blog-name' })
  @IsSlug()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeature: boolean;
}
