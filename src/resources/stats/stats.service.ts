import { Category } from '@/entities/Category';
import { Comment } from '@/entities/Comment';
import { Post } from '@/entities/Post';
import { User } from '@/entities/User';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findAll() {
    const users = await this.userRepository.count();
    const posts = await this.postRepository.count();
    const categories = await this.categoryRepository.count();
    const comments = await this.commentRepository.count();
    return {
      totalUsers: users,
      totalPosts: posts,
      totalCategories: categories,
      totalComments: comments,
    };
  }
}
