import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  SetMetadata,
  Request,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Role } from '@/types/role';
import { Public } from '@/utils/secure';
import { User } from '@/entities/User';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { Comment } from '@/entities/Comment';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: Express.Request & { user: User },
  ) {
    return this.commentsService.create({
      ...createCommentDto,
      user_id: req.user.id,
    });
  }

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<Comment>) {
    const options = buildFindManyOptions(query);
    return this.commentsService.findAll(options);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
