import { PartialType } from '@nestjs/swagger';
import { CreateProductCategoryRequest } from './create-product-category.request';

export class UpdateProductCategoryRequest extends PartialType(CreateProductCategoryRequest) {}
