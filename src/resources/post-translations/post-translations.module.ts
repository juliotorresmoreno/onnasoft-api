import { Module } from '@nestjs/common';
import { PostTranslationsService } from './post-translations.service';
import { PostTranslationsController } from './post-translations.controller';

@Module({
  controllers: [PostTranslationsController],
  providers: [PostTranslationsService],
})
export class PostTranslationsModule {}
