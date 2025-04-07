import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductRequest {
  @ApiProperty({ example: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 10 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 1 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: ['https://example.com/image.png', 'https://example.com/image2.png'] })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images: string[];

  @ApiProperty({ example: ['https://example.com/video.mp4', 'https://example.com/video.mp4'] })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  videos: string[];

  @ApiProperty({ example: 'Product description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: '4510c78a-2d61-41b5-93e3-d43a2422f3d8' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'iphone-16' })
  @IsString()
  @IsOptional()
  slug: string;
}
