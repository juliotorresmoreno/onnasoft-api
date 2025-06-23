import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PostTranslation } from '@/entities/PostTranslations';
import { FindManyOptions, IsNull, Repository } from 'typeorm';
import { Configuration } from '@/types/configuration';

@Injectable()
export class PostTranslationsService {
  private readonly defaultLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PostTranslation)
    private readonly categoriesRepository: Repository<PostTranslation>,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  async findAll(options?: FindManyOptions<PostTranslation>) {
    let buildOptions: FindManyOptions<PostTranslation> | undefined = {
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' },
      take: this.defaultLimit,
    };
    if (options) {
      buildOptions = {
        ...buildOptions,
        ...options,
        select: options.select || buildOptions.select,
        order: options.order || buildOptions.order,
        take: options.take || buildOptions.take,
        where: { ...options.where, deleted_at: IsNull() },
      };
    }
    const [data, count] =
      await this.categoriesRepository.findAndCount(buildOptions);

    return {
      data: await Promise.all(
        data.map(async (category) => {
          return {
            ...category,
            postCount: 0,
          };
        }),
      ),
      total: count,
      skip: buildOptions.skip || 0,
      take: buildOptions.take || this.defaultLimit,
    };
  }

  findOne(id: number) {
    return this.categoriesRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
  }
}
