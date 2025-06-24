import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@/entities/Post';
import { EmbeddingService } from '@/services/embedding/embedding.service';
import { PostTranslationsModule } from '../post-translations/post-translations.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService, EmbeddingService],
  imports: [PostTranslationsModule, TypeOrmModule.forFeature([Post])],
})
export class PostsModule {}
