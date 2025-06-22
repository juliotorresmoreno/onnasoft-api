import { PartialType } from '@nestjs/swagger';
import { CreateCategoryTranslationDto } from './create-category-translation.dto';

export class UpdateCategoryTranslationDto extends PartialType(CreateCategoryTranslationDto) {}
