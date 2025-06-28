import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/User';
import { Post } from '@/entities/Post';
import { Category } from '@/entities/Category';
import { Comment } from '@/entities/Comment';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
  imports: [TypeOrmModule.forFeature([User, Post, Category, Comment])],
})
export class StatsModule {}
