import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  SetMetadata,
  Request,
  InternalServerErrorException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { IsNull } from 'typeorm';
import { Role } from '@/types/role';
import { User } from '@/entities/User';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { Notification } from '@/entities/Notification';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Get()
  async findAll(@Query() query: QueryParams<Notification>) {
    const options = buildFindManyOptions(query);
    return this.notificationsService.findAll(options);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Patch(':id/read')
  read(
    @Request() req: Express.Request & { user: User },
    @Param('id') id: string,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.notificationsService
      .updateAll(
        {
          where: {
            id: id,
            deleted_at: IsNull(),
            userId: req.user.id,
          },
        },
        { read: true },
      )
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to mark notification with id ${id} as read: ${error.message}`,
        );
      });
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Patch('read-all')
  readAll(@Request() req: Express.Request & { user: User }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.notificationsService
      .updateAll(
        {
          where: { userId: req.user.id, deleted_at: IsNull() },
        },
        { read: true },
      )
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to mark all notifications as read: ${error.message}`,
        );
      });
  }

  @SetMetadata('roles', [Role.Admin])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id).catch((error) => {
      throw new InternalServerErrorException(
        `Failed to delete notification with id ${id}: ${error.message}`,
      );
    });
  }
}
