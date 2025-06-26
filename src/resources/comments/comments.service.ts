import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, IsNull, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import { Comment } from '@/entities/Comment';

@Injectable()
export class CommentsService {
  private readonly defaultLimit: number;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  async create(payload: CreateCommentDto & { user_id: number }) {
    if (payload.reply_to_id) {
      const replyTo = await this.commentRepository.findOne({
        where: {
          id: payload.reply_to_id,
          reply_to_id: IsNull(),
        },
        order: { created_at: 'DESC' },
      });

      if (!replyTo) {
        payload.reply_to_id = null;
      }
    }

    return this.commentRepository.save(payload);
  }

  async findAll(options?: FindManyOptions<Comment>) {
    let buildOptions: FindManyOptions<Comment> | undefined = {
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
      await this.commentRepository.findAndCount(buildOptions);

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
    return this.commentRepository.findOne({
      where: { id },
    });
  }

  update(id: number, payload: UpdateCommentDto) {
    return this.commentRepository.update(id, payload).then(() => {
      return this.commentRepository.findOneBy({ id });
    });
  }

  remove(id: number) {
    return this.commentRepository.delete(id).then(() => {
      return { deleted: true, id };
    });
  }
}
