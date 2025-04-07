import { IsSlug } from '@/validations/is-slug.validation';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEventRequest {
  @ApiProperty({ example: 'Event Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: ['https://example.com/image.png', 'https://example.com/image2.png'] })
  @IsString({ each: true })
  @IsOptional()
  images: string[];

  @ApiProperty({ example: 'Event Description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'event-1' })
  @IsSlug()
  @IsString()
  @IsNotEmpty()
  slug: string;
}
