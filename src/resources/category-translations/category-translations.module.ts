import { Module } from '@nestjs/common';
import { CategoryTranslationsService } from './category-translations.service';
import { CategoryTranslationsController } from './category-translations.controller';

@Module({
  controllers: [CategoryTranslationsController],
  providers: [CategoryTranslationsService],
})
export class CategoryTranslationsModule {}
