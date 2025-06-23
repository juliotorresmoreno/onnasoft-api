import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostTranslationsService } from './post-translations.service';
import { Public } from '@/utils/secure';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { PostTranslation } from '@/entities/PostTranslations';

@Controller('post-translations')
export class PostTranslationsController {
  constructor(
    private readonly postTranslationsService: PostTranslationsService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<PostTranslation>) {
    const options = buildFindManyOptions(query);
    return this.postTranslationsService.findAll(options);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postTranslationsService.findOne(+id);
  }
}
