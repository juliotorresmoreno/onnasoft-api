import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { Category } from '@/entities/Category';
import { Public } from '@/utils/secure';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<Category>) {
    const options = buildFindManyOptions(query);
    return this.categoriesService.findAll(options);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }
}
