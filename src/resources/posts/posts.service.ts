import { Post } from '@/entities/Post';
import { PostLike } from '@/entities/PostLike';
import { EmbeddingService } from '@/services/embedding/embedding.service';
import { Configuration } from '@/types/configuration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, In, Repository } from 'typeorm';

@Injectable()
export class PostsService {
  private readonly defaultLimit: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  async search(query: string, locale: string = 'en', limit?: number) {
    if (!query) {
      return [];
    }
    const embedding = await this.embeddingService.generateEmbedding(query);
    const result = await this.dataSource.query(
      `
      SELECT post_translation_id, locale, embedding
      FROM post_translation_vectors
      WHERE locale = $1
      ORDER BY embedding <-> $2
      LIMIT $3
      `,
      [locale, `[${embedding.join(',')}]`, limit ?? this.defaultLimit],
    );

    return this.findAll({
      where: {
        translations: {
          id: In(result.map((r) => r.post_translation_id)),
          locale: locale,
        } as any,
      },
      relations: [
        'translations',
        'author',
        'author.photo',
        'cover_image',
        'category',
      ],
    });
  }

  async findAll(options?: FindManyOptions<Post>) {
    let buildOptions: FindManyOptions<Post> | undefined = {
      order: { created_at: 'DESC' },
      take: this.defaultLimit,
    };
    if (options) {
      buildOptions = {
        ...buildOptions,
        ...options,
      };
    }
    const [data, count] = await this.postsRepository.findAndCount(buildOptions);

    return {
      docs: data,
      hasNextPage:
        count >
        (buildOptions.skip || 0) + (buildOptions.take || this.defaultLimit),
      hasPrevPage: (buildOptions.skip || 0) > 0,
      limit: buildOptions.take || this.defaultLimit,
      nextPage:
        count >
        (buildOptions.skip || 0) + (buildOptions.take || this.defaultLimit)
          ? (buildOptions.skip || 0) +
            ((buildOptions.skip || 0) +
              (buildOptions.take || this.defaultLimit)) /
              (buildOptions.take || this.defaultLimit)
          : null,
      page: Math.floor(
        ((buildOptions.skip || 0) + (buildOptions.take || this.defaultLimit)) /
          (buildOptions.take || this.defaultLimit),
      ),
      pagingCounter: (buildOptions.skip || 0) + 1,
      prevPage:
        (buildOptions.skip || 0) > 0
          ? Math.floor(
              ((buildOptions.skip || 0) -
                (buildOptions.take || this.defaultLimit)) /
                (buildOptions.take || this.defaultLimit),
            )
          : null,
      totalDocs: count,
      totalPages: Math.ceil(count / (buildOptions.take || this.defaultLimit)),
    };
  }

  async view(id: number) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new Error('Post not found');
    }

    post.views = (post.views || 0) + 1;
    return this.postsRepository.save(post);
  }

  async like(id: number, userId: number) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new Error('Post not found');
    }

    const existingLike = await this.postLikesRepository.findOne({
      where: { post_id: id, user_id: userId },
    });

    if (existingLike) {
      await this.postLikesRepository.remove(existingLike);
      post.likes = (post.likes || 0) - 1;
    } else {
      const newLike = this.postLikesRepository.create({
        post_id: id,
        user_id: userId,
      });
      await this.postLikesRepository.save(newLike);
      post.likes = (post.likes || 0) + 1;
    }
    return this.postsRepository.save(post);
  }

  async update(id: number, post: Partial<Post>) {
    const existingPost = await this.postsRepository.findOneBy({ id });
    if (!existingPost) {
      throw new Error('Post not found');
    }
    const updatedPost = Object.assign(existingPost, post);
    return this.postsRepository.save(updatedPost);
  }

  findOne(id: number) {
    return this.postsRepository.findOne({
      where: { id },
    });
  }
}
