import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/entities/User';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordAuthDto } from './dto/forgot-password-auth.dto';
import { Public } from '@/utils/secure';
import { Role } from '@/types/role';

class RegisterResponseDto {
  @ApiResponseProperty()
  message: string;
}

class LoginResponseDto {
  @ApiResponseProperty()
  access_token: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBody({ type: RegisterAuthDto })
  async register(@Body(new ValidationPipe()) registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBody({ type: LoginAuthDto })
  @Post('/login')
  login(@Request() req: Express.Request & { user: User }) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'OAuth login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in via OAuth',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @Get('/refresh')
  refresh(@Request() req: Express.Request & { user: User }) {
    return this.authService.refreshToken(req.user);
  }

  @Public()
  @Post('/oauth/login')
  loginOAuth(@Body('token') token: string) {
    return this.authService.loginOAuth(token);
  }

  @Public()
  @Post('/oauth/login/google')
  loginOAuthGoogle(@Body('token') token: string) {
    return this.authService.loginOauthGoogle(token);
  }

  @Public()
  @Post('/forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset link sent to email',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBody({ type: ForgotPasswordAuthDto })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('/verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email successfully verified',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(@Body('token') token: string) {
    await this.authService.verifyEmail(token);

    return {
      message: 'Email successfully verified',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('/resend-verification')
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification email resent successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email or user not found',
  })
  async resendVerification(@Body('email') email: string) {
    await this.authService.resendVerification(email);

    return {
      message: 'Verification email resent successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);

    return {
      message: 'Password successfully reset',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Get('/me')
  @ApiOperation({ summary: 'Get user session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User session retrieved successfully',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponseProperty({ type: User })
  async me(@Request() req: Express.Request & { user: User }) {
    return {
      user: req.user,
      message: 'User session retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }
}
