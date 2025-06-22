import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { Notification } from '@/entities/Notification';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';

@Injectable()
export class NotificationsService {
  private readonly defaultLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  create(payload: Notification) {
    return this.notificationRepository.save({
      ...payload,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  async findAll(options?: FindManyOptions<Notification>) {
    let buildOptions: FindManyOptions<Notification> | undefined = {
      where: { deleted_at: IsNull() },
      select: [
        'id',
        'title',
        'read',
        'metadata',
        'userId',
        'created_at',
        'updated_at',
      ],
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
    const [notifications, count] =
      await this.notificationRepository.findAndCount(buildOptions);

    return {
      data: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        read: notification.read,
        metadata: notification.metadata,
        userId: notification.userId,
        createdAt: notification.created_at,
        updatedAt: notification.updated_at,
      })),
      total: count,
      skip: buildOptions.skip || 0,
      take: buildOptions.take || this.defaultLimit,
    };
  }

  findOne(options: FindOneOptions<Notification>) {
    return this.notificationRepository.findOne(options);
  }

  async update(id: string, payload: Partial<Notification>) {
    await this.notificationRepository.update(id, payload);
    return this.findOne({ where: { id } });
  }

  async updateAll(
    options?: FindManyOptions<Notification>,
    payload?: Partial<Notification>,
  ) {
    let buildOptions: FindManyOptions<Notification> | undefined = {
      where: { deleted_at: IsNull() },
      select: ['id', 'title', 'read', 'metadata', 'userId'],
      order: { deleted_at: 'DESC' },
      take: 100,
    };
    if (options) {
      buildOptions = {
        ...buildOptions,
        ...options,
        where: { ...options.where, deleted_at: IsNull() },
      };
    }
    const notifications = await this.notificationRepository.find(buildOptions);
    if (notifications.length === 0) {
      throw new Error('No notifications found to update');
    }
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      ...payload,
      updatedAt: new Date(),
    }));
    await this.notificationRepository.save(updatedNotifications);
    return this.findAll(options);
  }

  remove(id: string) {
    return this.notificationRepository.delete(id);
  }
}
