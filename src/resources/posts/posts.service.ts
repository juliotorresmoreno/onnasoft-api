import { PostLike } from '@/entities/PostLike';
import { EmbeddingService } from '@/services/embedding/embedding.service';
import { Configuration } from '@/types/configuration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, In, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { AiService } from '../ai/ai.service';
import { languages } from '@/types/languages';
import { PostTranslation } from '@/entities/PostTranslations';
import { Post } from '@/entities/Post';

@Injectable()
export class PostsService {
  private readonly defaultLimit: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostTranslation)
    private readonly postTranslationsRepository: Repository<PostTranslation>,
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  async create(post: CreatePostDto & { author_id: number }) {
    const translations: Partial<PostTranslation>[] = [];

    console.log('[CREATE] Starting post creation...');

    const result = await this.dataSource.transaction(async (manager) => {
      console.log('[TRANSACTION] Translating title to generate slug...');
      const slug = (await this.aiService.translate(post.title, 'en'))
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      console.log(`[TRANSACTION] Generated slug: ${slug}`);

      console.log('[TRANSACTION] Generating content...');
      const content = await this.aiService.generateContent(
        post.title,
        post.excerpt,
        post.image_prompt,
      );

      console.log('[TRANSACTION] Generating image...');
      const image = await this.aiService.generateImage(
        post.image_prompt || `A blog post about ${post.title}`,
      );

      console.log('[TRANSACTION] Creating Post entity...');
      const newPost = this.postsRepository.create({
        ...post,
        slug,
        content,
        cover_image_id: image.id,
        cover_thumbnail_id: image.thumbnail?.id,
      });

      console.log('[TRANSACTION] Saving Post...');
      const savedPost = await manager.save(Post, newPost);
      console.log('[TRANSACTION] Post saved with ID:', savedPost.id);

      for (const lang of languages) {
        console.log(`[TRANSLATIONS] Translating to ${lang}...`);
        const translatedTitle = await this.aiService.translate(
          post.title,
          lang,
        );
        const translatedExcerpt = post.excerpt
          ? await this.aiService.translate(post.excerpt, lang)
          : undefined;
        const translatedContent = await this.aiService.translate(content, lang);

        translations.push({
          locale: lang,
          translated_title: translatedTitle,
          translated_excerpt: translatedExcerpt,
          translated_content: translatedContent,
          slug,
          post_id: savedPost.id,
        });
      }

      console.log('[TRANSLATIONS] Saving translations...');
      const postTranslations = manager.create(PostTranslation, translations);
      await manager.save(PostTranslation, postTranslations);

      return savedPost;
    });

    console.log('[EMBEDDING] Generating embeddings...');
    await Promise.all(
      translations.map(async (translation) => {
        if (!translation.locale || !translation.translated_content) {
          console.warn(
            `[EMBEDDING] Skipping embedding for incomplete translation:`,
            translation,
          );
          return;
        }

        const content = [
          translation.translated_title,
          translation.translated_content,
        ]
          .filter(Boolean)
          .join('\n')
          .replace(/\s+/g, ' ')
          .trim();

        const embedding =
          await this.embeddingService.generateEmbedding(content);

        console.log(
          `[EMBEDDING] Saving embedding for locale ${translation.locale}...`,
        );
        await this.dataSource.query(
          `INSERT INTO post_translation_vectors
           (post_translation_id, locale, embedding, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (post_translation_id, locale)
         DO UPDATE SET
           embedding = EXCLUDED.embedding,
           updated_at = NOW()`,
          [translation.id, translation.locale, `[${embedding.join(', ')}]`],
        );
      }),
    );

    console.log('[CREATE] Post creation completed.');
    return result;
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
