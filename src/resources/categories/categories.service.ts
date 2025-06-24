import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { Category } from '@/entities/Category';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from '@/types/configuration';

@Injectable()
export class CategoriesService {
  private readonly defaultLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  async findAll(options?: FindManyOptions<Category>) {
    let buildOptions: FindManyOptions<Category> | undefined = {
      where: {},
      order: { created_at: 'DESC' },
      take: this.defaultLimit,
    };
    if (options) {
      buildOptions = {
        ...buildOptions,
        ...options,
      };
    }
    const [data, count] =
      await this.categoriesRepository.findAndCount(buildOptions);

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
    return this.categoriesRepository.findOne({
      where: { id },
    });
  }
}
