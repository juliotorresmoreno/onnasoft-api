import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UsersService } from '../users/users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { comparePassword, hashPassword } from '@/utils/secure';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '@/entities/Notification';

@Injectable()
export class AccountService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  findOne(id: number) {
    return this.usersService.findOne({
      select: [
        'id',
        'email',
        'name',
        'language',
        'timezone',
        'newsletter',
        'plan',
        'created_at',
        'updated_at',
      ],
      where: { id },
    });
  }

  async update(id: number, payload: UpdateAccountDto) {
    await this.usersService.update(id, payload).catch((error) => {
      throw new InternalServerErrorException(
        'Failed to update account',
        error.message,
      );
    });

    await this.notificationsService
      .create(
        new Notification({
          title: 'Account Updated',
          userId: id,
          metadata: {
            type: 'account_update',
            message: 'Your account details have been successfully updated.',
          },
        }),
      )
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to create notification for account update',
          error.message,
        );
      });

    return this.findOne(id).catch((error) => {
      throw new InternalServerErrorException(
        'Failed to retrieve updated account',
        error.message,
      );
    });
  }

  async updatePassword(id: number, payload: UpdatePasswordDto) {
    const hashedPassword = await hashPassword(payload.newPassword);

    const user = await this.usersService
      .findOne({
        select: ['id', 'password'],
        where: { id },
      })
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to retrieve user for password update',
          error.message,
        );
      });
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const isPasswordValid = await comparePassword(
      payload.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.usersService
      .update(id, {
        password: hashedPassword,
      })
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to update password',
          error.message,
        );
      });

    await this.notificationsService
      .create(
        new Notification({
          title: 'Password Updated',
          userId: id,
          metadata: {
            type: 'password_update',
            message: 'Your password has been successfully updated.',
          },
        }),
      )
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to create notification for password update',
          error.message,
        );
      });

    return this.findOne(id).catch((error) => {
      throw new InternalServerErrorException(
        'Failed to retrieve updated account',
        error.message,
      );
    });
  }

  removeMe(id: number) {
    return this.usersService.remove(id).catch((error) => {
      throw new InternalServerErrorException(
        'Failed to delete account',
        error.message,
      );
    });
  }
}
