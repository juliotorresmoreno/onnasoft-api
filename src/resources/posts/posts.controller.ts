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
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Public } from '@/utils/secure';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { Role } from '@/types/role';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '@/entities/User';
import { Post as PostEntity } from '@/entities/Post';
import { CreatePostDto } from './dto/create-post.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ValidationPipe } from '@/pipes/validation.pipe';

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
  async findAll(@Query() query: QueryParams<PostEntity>) {
    const options = buildFindManyOptions(query);

    return this.postsService.findAll(options);
  }

  @SetMetadata('roles', [Role.Admin])
  @UseInterceptors(AnyFilesInterceptor())
  @Post()
  create(
    @Request() req: Express.Request & { user: User },
    @Body(new ValidationPipe()) payload: CreatePostDto,
  ) {
    return this.postsService.create({ ...payload, author_id: req.user.id });
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
