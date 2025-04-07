import { IsSlug } from '@/validations/is-slug.validation';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SlugRequest {
  @ApiProperty({ example: 'event-1' })
  @IsSlug()
  @IsString()
  @IsNotEmpty()
  slug: string;
}
