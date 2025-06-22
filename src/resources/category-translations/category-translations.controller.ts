import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryTranslationsService } from './category-translations.service';
import { CreateCategoryTranslationDto } from './dto/create-category-translation.dto';
import { UpdateCategoryTranslationDto } from './dto/update-category-translation.dto';

@Controller('category-translations')
export class CategoryTranslationsController {
  constructor(private readonly categoryTranslationsService: CategoryTranslationsService) {}

  @Post()
  create(@Body() createCategoryTranslationDto: CreateCategoryTranslationDto) {
    return this.categoryTranslationsService.create(createCategoryTranslationDto);
  }

  @Get()
  findAll() {
    return this.categoryTranslationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryTranslationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryTranslationDto: UpdateCategoryTranslationDto) {
    return this.categoryTranslationsService.update(+id, updateCategoryTranslationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryTranslationsService.remove(+id);
  }
}
