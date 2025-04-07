import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterRequest {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '+841234567890',
    description: 'Phone number (optional)',
    required: false,
  })
  @IsOptional()
  @Matches(/^([+]\d{2})?\d{10}$/, { message: 'Invalid phone number format' })
  phone_number?: string;

  @ApiProperty({ example: 'securePassword123!', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'https://cdn.pixabay.com/photo/default-avatar.png',
    description: 'User avatar URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    example: 'New York, USA',
    description: 'User location',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;
}
