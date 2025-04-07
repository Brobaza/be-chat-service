import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatEndpointRequest {
  @IsString()
  @IsOptional()
  endpoint: string;
}
