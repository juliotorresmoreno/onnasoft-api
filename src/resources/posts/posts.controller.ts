import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Public } from '@/utils/secure';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { PostTranslation } from '@/entities/PostTranslations';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<PostTranslation>) {
    const options = buildFindManyOptions(query);
    const locale = query.locale || 'en';
    options.relations = ['translations'];
    options.where = {
      ...options.where,
      translations: {
        locale,
      },
    };
    return this.postsService.findAll(options);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }
}
