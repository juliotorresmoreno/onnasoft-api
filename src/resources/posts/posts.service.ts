import { Post } from '@/entities/Post';
import { EmbeddingService } from '@/services/embedding/embedding.service';
import { Configuration } from '@/types/configuration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, In, Repository } from 'typeorm';
import { PostTranslationsService } from '../post-translations/post-translations.service';

@Injectable()
export class PostsService {
  private readonly defaultLimit: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postTranslationsService: PostTranslationsService,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  async search(query: string, locale: string = 'en', limit?: number) {
    console.log(`Searching for query: ${query} in locale: ${locale}`);
    if (!query) {
      console.warn('Empty query provided, returning empty result set.');
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

  findOne(id: number) {
    return this.postsRepository.findOne({
      where: { id },
    });
  }
}
