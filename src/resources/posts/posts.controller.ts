import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Public } from '@/utils/secure';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { PostTranslation } from '@/entities/PostTranslations';
import { Role } from '@/types/role';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '@/entities/User';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('locale') locale: string = 'en',
    @Query('limit') limit?: number,
  ) {
    return this.postsService.search(query, locale, limit);
  }

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<PostTranslation>) {
    const options = buildFindManyOptions(query);

    return this.postsService.findAll(options);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdatePostDto) {
    return this.postsService.update(+id, payload);
  }

  @Public()
  @Post(':id/view')
  view(@Param('id') id: string) {
    return this.postsService.view(+id);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post(':id/like')
  like(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: User },
  ) {
    return this.postsService.like(+id, req.user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }
}
