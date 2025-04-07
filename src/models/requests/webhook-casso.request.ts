import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CassoWebhookTransactionRequest {
  @IsNumber()
  id: number;

  @IsString()
  tid: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  cusum_balance: number;

  @IsString()
  when: string;

  @IsString()
  bank_sub_acc_id: string;

  @IsString()
  subAccId: string;

  @IsString()
  bankName: string;

  @IsString()
  bankAbbreviation: string;

  @IsString()
  virtualAccount: string;

  @IsString()
  virtualAccountName: string;

  @IsString()
  corresponsiveName: string;

  @IsString()
  corresponsiveAccount: string;

  @IsString()
  corresponsiveBankId: string;

  @IsString()
  corresponsiveBankName: string;
}

export class CassoWebhookRequest {
  @IsNumber()
  error: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CassoWebhookTransactionRequest)
  data: CassoWebhookTransactionRequest[];
}
