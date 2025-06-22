import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities/User';
import { FindOneOptions, Repository, IsNull, FindManyOptions } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(payload: CreateUserDto & { isEmailVerified?: boolean }) {
    return this.userRepository.save({
      ...payload,
      isEmailVerified: payload.isEmailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  findAll(options?: FindManyOptions<User>) {
    let buildOptions: FindManyOptions<User> | undefined = {
      where: { deleted_at: IsNull() },
      select: ['id', 'name', 'email'],
      order: { created_at: 'DESC' },
      take: 100,
    };
    if (options) {
      buildOptions = {
        ...buildOptions,
        ...options,
        where: { ...options.where, deleted_at: IsNull() },
      };
    }
    return this.userRepository.find(buildOptions);
  }

  findOne(options: FindOneOptions<User>) {
    return this.userRepository.findOne(options);
  }

  async update(id: number, payload: Partial<User>) {
    await this.userRepository.update(id, payload);
    return this.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.userRepository.delete(id);
    return { deleted: true };
  }
}
