import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostTranslationsService } from './post-translations.service';
import { CreatePostTranslationDto } from './dto/create-post-translation.dto';
import { UpdatePostTranslationDto } from './dto/update-post-translation.dto';

@Controller('post-translations')
export class PostTranslationsController {
  constructor(private readonly postTranslationsService: PostTranslationsService) {}

  @Post()
  create(@Body() createPostTranslationDto: CreatePostTranslationDto) {
    return this.postTranslationsService.create(createPostTranslationDto);
  }

  @Get()
  findAll() {
    return this.postTranslationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postTranslationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostTranslationDto: UpdatePostTranslationDto) {
    return this.postTranslationsService.update(+id, updatePostTranslationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postTranslationsService.remove(+id);
  }
}
