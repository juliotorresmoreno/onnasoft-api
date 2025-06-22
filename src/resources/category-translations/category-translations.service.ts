import { Injectable } from '@nestjs/common';
import { CreateCategoryTranslationDto } from './dto/create-category-translation.dto';
import { UpdateCategoryTranslationDto } from './dto/update-category-translation.dto';

@Injectable()
export class CategoryTranslationsService {
  create(createCategoryTranslationDto: CreateCategoryTranslationDto) {
    return 'This action adds a new categoryTranslation';
  }

  findAll() {
    return `This action returns all categoryTranslations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryTranslation`;
  }

  update(id: number, updateCategoryTranslationDto: UpdateCategoryTranslationDto) {
    return `This action updates a #${id} categoryTranslation`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryTranslation`;
  }
}
