import { PartialType } from '@nestjs/mapped-types';
import { CreateProductRequest } from './create-product.request';

export class UpdateProductRequest extends PartialType(CreateProductRequest) {}
