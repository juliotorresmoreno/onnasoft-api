import { Module } from '@nestjs/common';
import { CategoryTranslationsService } from './category-translations.service';
import { CategoryTranslationsController } from './category-translations.controller';
import { CategoryTranslation } from '@/entities/CategoryTranslation';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CategoryTranslationsController],
  providers: [CategoryTranslationsService],
  imports: [TypeOrmModule.forFeature([CategoryTranslation])],
})
export class CategoryTranslationsModule {}
