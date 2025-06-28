import { JwtService } from '@nestjs/jwt';
import { User } from '@/entities/User';
import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import {
  comparePassword,
  generateRandomToken,
  hashPassword,
} from '@/utils/secure';
import { UsersService } from '@/resources/users/users.service';
import { EmailService } from '@/services/email/email.service';
import { OauthIdTokenPayload } from '@/types/jwt';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import { Role } from '@/types/role';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '@/entities/Notification';
import { GoogleAuthUser } from '@/types/models';
import { MediaService } from '../media/media.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    try {
      const existingUser = await this.usersService.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await hashPassword(registerDto.password);
      const newUser = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
      });

      const passwordResetToken = generateRandomToken();
      await this.usersService.update(newUser.id, {
        verificationToken: passwordResetToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000 * 24),
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Welcome to ProMeet',
          userId: newUser.id,
          metadata: {
            type: 'welcome',
            message: 'Thank you for registering with ProMeet!',
          },
        }),
      );

      await this.emailService.sendVerificationEmail({
        to: newUser.email,
        name: newUser.name,
        token: passwordResetToken,
      });

      await this.notificationsService.create(
        new Notification({
          title: 'New User Registration',
          userId: newUser.id,
          metadata: {
            type: 'registration',
            message: `New user registered with email: ${newUser.email}`,
          },
        }),
      );

      return {
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      this.logger.error(
        `Error during registration: ${error.message}`,
        error.stack,
      );

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Registration failed. Please try again later.',
      );
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findOne({
        where: { email },
        select: ['id', 'email', 'name'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const passwordResetToken = generateRandomToken();
      await this.usersService.update(user.id, {
        passwordResetToken: passwordResetToken,
        passwordResetTokenExpiresAt: new Date(Date.now() + 3600000),
      });

      await this.emailService.sendPasswordResetEmail({
        to: user.email,
        token: passwordResetToken,
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Password Reset Requested',
          userId: user.id,
          metadata: {
            type: 'password_reset',
            message: `Password reset requested for email: ${user.email}`,
          },
        }),
      );

      // Here you would typically send a reset password email
      // For simplicity, we just return the user data
      return {
        message: 'Password reset link sent to your email',
        user,
      };
    } catch (error) {
      this.logger.error(
        `Error during forgot password for email ${email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to process forgot password request. Please try again later.',
      );
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'password',
          'name',
          'is_email_verified',
          'role',
        ],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_email_verified) {
        throw new UnauthorizedException('Email not verified');
      }

      await this.notificationsService.create(
        new Notification({
          title: 'User Login',
          userId: user.id,
          metadata: {
            type: 'login',
            message: `User logged in with email: ${user.email}`,
          },
        }),
      );

      return {
        user: await this.usersService.findOne({
          where: { email },
          select: ['id', 'email', 'name'],
        }),
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error(
        `Error during login for email ${email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }
    }

    return null;
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.usersService.findOne({
        where: { verificationToken: token },
        select: ['id', 'email', 'name', 'verificationTokenExpiresAt'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid verification token');
      }

      if (!user.verificationTokenExpiresAt) {
        throw new UnauthorizedException('Verification token not found');
      }

      if (user.verificationTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Verification token expired');
      }

      await this.usersService.update(user.id, {
        is_email_verified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Email Verified',
          userId: user.id,
          metadata: {
            type: 'email_verification',
            message: `Email verified for user: ${user.email}`,
          },
        }),
      );

      await this.emailService.sendWelcomeEmail({
        to: user.email,
        name: user.name,
      });
    } catch (error) {
      this.logger.error(
        `Error during email verification with token ${token}: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }
    }
  }

  async resendVerification(email: string) {
    try {
      const user = await this.usersService.findOne({
        where: { email },
        select: ['id', 'email', 'name', 'verificationToken'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.is_email_verified) {
        throw new ConflictException('Email already verified');
      }

      const verificationToken = generateRandomToken();
      await this.usersService.update(user.id, {
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000 * 24),
      });

      await this.emailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        token: verificationToken,
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Verification Email Resent',
          userId: user.id,
          metadata: {
            type: 'verification',
            message: `Verification email resent to: ${user.email}`,
          },
        }),
      );

      return {
        message: 'Verification email resent successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error during resend verification for email ${email}: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to resend verification email. Please try again later.',
      );
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await this.usersService.findOne({
        where: { passwordResetToken: token },
        select: ['id', 'email', 'name', 'passwordResetTokenExpiresAt'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid reset token');
      }

      if (!user.passwordResetTokenExpiresAt) {
        throw new UnauthorizedException('Reset token not found');
      }

      if (user.passwordResetTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Reset token expired');
      }

      const hashedPassword = await hashPassword(newPassword);
      await this.usersService.update(user.id, {
        password: hashedPassword,
        is_email_verified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Password Reset',
          userId: user.id,
          metadata: {
            type: 'password_reset',
            message: `Password successfully reset for user: ${user.email}`,
          },
        }),
      );

      return {
        message: 'Password successfully reset',
      };
    } catch (error) {
      this.logger.error(
        `Error during password reset with token ${token}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to reset password. Please try again later.',
      );
    }
  }

  async login(user: User) {
    const updatedUser = await this.usersService.findOne({
      where: { id: user.id },
      select: [
        'id',
        'email',
        'name',
        'role',
        'is_email_verified',
        'created_at',
        'updated_at',
      ],
      relations: ['photo'],
    });

    const payload = { email: user.email, sub: user.id, role: Role.User };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after login');
    }

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      is_email_verified: updatedUser.is_email_verified,
      role: updatedUser.role,
      photo: updatedUser.photo,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };

    return {
      access_token,
      refresh_token,
      user: userData,
    };
  }

  refreshToken(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
    };
  }

  async verifyToken(token: string) {
    const config = this.configService.get('config') as Configuration;
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: config.secret,
      });
      return decoded;
    } catch (error) {
      this.logger.error(
        `Token verification failed: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async loginOauthGoogle(accessToken: string) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = (await res.json()) as GoogleAuthUser;
    if (!user || !user.email) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    let existingUser = await this.usersService.findOne({
      where: { email: user.email },
      select: ['id', 'email', 'name', 'is_email_verified'],
    });

    if (!existingUser) {
      const media = await this.uploadGoogleProfileImage(user);
      existingUser = await this.usersService.create({
        email: user.email,
        name: user.name || 'Google User',
        password: await hashPassword(generateRandomToken()),
        is_email_verified: true,
        photo_id: media.id,
      });
    } else if (!existingUser.is_email_verified) {
      throw new ConflictException('Email not verified');
    } else if (existingUser?.photo_id === null) {
      const media = await this.uploadGoogleProfileImage(user);
      existingUser = await this.usersService.update(existingUser.id, {
        photo_id: media.id,
      });
    }

    if (!existingUser) {
      throw new InternalServerErrorException(
        'User not found after Google OAuth login',
      );
    }

    await this.notificationsService.create(
      new Notification({
        title: 'OAuth Google Login',
        userId: existingUser.id,
        metadata: {
          type: 'oauth_login',
          message: `User logged in via OAuth Google with email: ${existingUser.email}`,
        },
      }),
    );

    return this.login(existingUser);
  }

  async uploadGoogleProfileImage(user: GoogleAuthUser) {
    const response = await fetch(
      user.picture || 'https://www.gravatar.com/avatar/' + user.email,
      {
        headers: {
          'User-Agent': 'OnnaSoft OAuth Service',
        },
      },
    );
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = user.picture
      ? (user.picture.split('/').pop() ?? user.email + '.png')
      : user.email + '.png';

    return this.mediaService.upload(buffer, filename);
  }

  async loginOAuth(token: string) {
    try {
      const decoded: OauthIdTokenPayload = await this.verifyToken(token);

      if (!decoded || !decoded.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      let user = await this.usersService.findOne({
        where: { email: decoded.email },
        select: ['id', 'email', 'name', 'is_email_verified'],
      });

      if (!user) {
        user = await this.usersService.create({
          email: decoded.email,
          name: decoded.name,
          password: await hashPassword(generateRandomToken()),
          is_email_verified: true,
        });
      } else if (!user.is_email_verified) {
        throw new ConflictException('Email not verified');
      }

      await this.notificationsService.create(
        new Notification({
          title: 'OAuth Login',
          userId: user.id,
          metadata: {
            type: 'oauth_login',
            message: `User logged in via OAuth with email: ${user.email}`,
          },
        }),
      );

      return this.login(user);
    } catch (error) {
      this.logger.error(
        `Error during OAuth login with token ${token}: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'OAuth login failed. Please try again later.',
      );
    }
  }
}
