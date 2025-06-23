import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoryTranslationsService } from './category-translations.service';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { Category } from '@/entities/Category';
import { Public } from '@/utils/secure';

@Controller('category-translations')
export class CategoryTranslationsController {
  constructor(
    private readonly categoryTranslationsService: CategoryTranslationsService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<Category>) {
    const options = buildFindManyOptions(query);
    return this.categoryTranslationsService.findAll(options);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryTranslationsService.findOne(+id);
  }
}
