import { ApiProperty } from '@nestjs/swagger';

export class VerifyResponse {
  @ApiProperty({ example: 'RDBrV3EQHxB1byrBnwSeLTWHKIamkd99j2Bf' })
  token: string;
}
