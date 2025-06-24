import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@/entities/Post';
import { EmbeddingService } from '@/services/embedding/embedding.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, EmbeddingService],
  imports: [TypeOrmModule.forFeature([Post])],
})
export class PostsModule {}
