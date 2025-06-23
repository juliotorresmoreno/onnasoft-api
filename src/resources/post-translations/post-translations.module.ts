import { Module } from '@nestjs/common';
import { PostTranslationsService } from './post-translations.service';
import { PostTranslationsController } from './post-translations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTranslation } from '@/entities/PostTranslations';

@Module({
  controllers: [PostTranslationsController],
  providers: [PostTranslationsService],
  imports: [TypeOrmModule.forFeature([PostTranslation])],
})
export class PostTranslationsModule {}
