import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBankAccountRequest {
  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ example: 'Duong Van Thinh' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'eb4e9a1b-3f27-47cb-b650-2e9915cf1703' })
  @IsUUID()
  @IsNotEmpty()
  bankId: string;
}
