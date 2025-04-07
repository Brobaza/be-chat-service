import { PartialType } from '@nestjs/swagger';
import { CreateBannerRequest } from './create-banner.request';

export class UpdateBannerRequest extends PartialType(CreateBannerRequest) {}
