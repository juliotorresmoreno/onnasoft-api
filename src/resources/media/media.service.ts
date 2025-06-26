import { Media } from '@/entities/Media';
import { Configuration } from '@/types/configuration';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { fileTypeFromBuffer } from 'file-type';
import { Injectable } from '@nestjs/common';
import imageSize from 'image-size';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MediaService {
  private readonly defaultLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Media)
    private readonly categoriesRepository: Repository<Media>,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  async upload(file: Buffer<ArrayBufferLike>, filename: string) {
    const filePath = path.join(process.cwd(), 'media', filename);

    // Ensure the media directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Write the file to the filesystem
    fs.writeFileSync(filePath, file);
    const dimensions = imageSize(file);
    const fileType = await fileTypeFromBuffer(file);

    return this.categoriesRepository.save({
      filename,
      mime_type: fileType?.mime || 'application/octet-stream',
      filesize: file.byteLength,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  async findAll(options?: FindManyOptions<Media>) {
    let buildOptions: FindManyOptions<Media> | undefined = {
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
