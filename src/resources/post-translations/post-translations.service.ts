import { Injectable } from '@nestjs/common';
import { CreatePostTranslationDto } from './dto/create-post-translation.dto';
import { UpdatePostTranslationDto } from './dto/update-post-translation.dto';

@Injectable()
export class PostTranslationsService {
  create(createPostTranslationDto: CreatePostTranslationDto) {
    return 'This action adds a new postTranslation';
  }

  findAll() {
    return `This action returns all postTranslations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postTranslation`;
  }

  update(id: number, updatePostTranslationDto: UpdatePostTranslationDto) {
    return `This action updates a #${id} postTranslation`;
  }

  remove(id: number) {
    return `This action removes a #${id} postTranslation`;
  }
}
