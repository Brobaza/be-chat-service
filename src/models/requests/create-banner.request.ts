import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, IsInt, Min, IsEnum } from 'class-validator';

export class CreateBannerItemRequest {
  @ApiProperty({ example: 'Big Sale Banner' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Up to 50% off!' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ example: 'Find the best deals on our products.' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 'https://example.com/banner-item-link' })
  @IsUrl()
  @IsOptional()
  link?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  isOpenNewTab?: boolean;

  @ApiProperty({ example: 'https://example.com/banner-item.jpg' })
  @IsUrl()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: 'image', enum: ['image', 'video', 'gif'] })
  @IsEnum(['image', 'video', 'gif'])
  @IsOptional()
  type?: 'image' | 'video' | 'gif';

  @ApiProperty({ example: 1, description: 'The order of the banner item in its hierarchy' })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class CreateBannerRequest {
  @ApiProperty({ example: 'HOME' })
  @IsString()
  @IsNotEmpty()
  page: string;

  @ApiProperty({ example: 1, description: 'The display order of the banner.' })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiProperty({
    type: () => [CreateBannerItemRequest],
    description: 'List of banner items',
    example: [
      {
        title: 'Big Sale Banner',
        subtitle: 'Up to 50% off!',
        content: 'Find the best deals on our products.',
        link: 'https://example.com/banner-item-link',
        isOpenNewTab: false,
        image: 'https://example.com/banner-item.jpg',
        type: 'IMAGE',
        order: 1,
      },
      {
        title: 'New Collection',
        subtitle: 'Spring Collection 2025',
        content: 'Explore the new trends of the season.',
        link: 'https://example.com/spring-collection',
        isOpenNewTab: true,
        image: 'https://example.com/spring-collection.jpg',
        type: 'YOUTUBE',
        order: 2,
      },
    ],
  })
  @IsNotEmpty()
  items: CreateBannerItemRequest[];
}
