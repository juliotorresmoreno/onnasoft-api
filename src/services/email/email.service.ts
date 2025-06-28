import { Inject, Injectable } from '@nestjs/common';
import { createEmailStrategy } from './email-strategy.factory';
import { EmailStrategy } from './strategies/email-strategy.interface';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import Handlebars from 'handlebars';
import * as fs from 'fs';

interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

interface SendPasswordResetEmailParams {
  to: string;
  token: string;
}

interface SendWelcomeEmailParams {
  to: string;
  name: string;
}

@Injectable()
export class EmailService {
  private readonly strategy: EmailStrategy;
  private readonly templates: {
    verification: Handlebars.TemplateDelegate;
    passwordReset: Handlebars.TemplateDelegate;
    welcome: Handlebars.TemplateDelegate;
  };
  private readonly config: Configuration;

  constructor(@Inject() private readonly configService: ConfigService) {
    this.config = this.configService.get('config') as Configuration;
    this.strategy = createEmailStrategy(this.config.email.strategy, {
      resendApiKey: this.config.email.resendApiKey,
      fromEmail: this.config.email.fromEmail,
    });

    const templates = {
      verification: fs.readFileSync(
        'src/services/email/templates/verification.html',
        'utf-8',
      ),
      passwordReset: fs.readFileSync(
        'src/services/email/templates/password-reset.html',
        'utf-8',
      ),
      welcome: fs.readFileSync(
        'src/services/email/templates/welcome.html',
        'utf-8',
      ),
    };
    this.templates = {
      verification: Handlebars.compile(templates.verification),
      passwordReset: Handlebars.compile(templates.passwordReset),
      welcome: Handlebars.compile(templates.welcome),
    };
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.strategy.send(to, subject, html);
  }

  async sendVerificationEmail(
    params: SendVerificationEmailParams,
  ): Promise<void> {
    const { to, name, token } = params;
    const url = `${this.config.baseUrl}/admin/verify-email?token=${token}`;
    const template = this.templates.verification;
    const html = template({
      verification_url: url,
      user_name: name,
      user_email: to,
      company_name: this.config.company.name,
      company_address_street: this.config.company.addressStreet,
      support_email: this.config.company.supportEmail,
    });

    await this.strategy.send(to, 'Verify your account', html);
  }

  async sendPasswordResetEmail(
    params: SendPasswordResetEmailParams,
  ): Promise<void> {
    const { to, token } = params;
    const url = `${this.config.baseUrl}/admin/reset-password?token=${token}`;
    const template = this.templates.passwordReset;
    const html = template({
      reset_url: url,
      user_email: to,
      company_name: this.config.company.name,
      company_address_line1: this.config.company.addressLine1,
      company_address_line2: this.config.company.addressLine2,
      support_email: this.config.company.supportEmail,
    });

    await this.strategy.send(to, 'Reset your password', html);
  }

  async sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<void> {
    const { to, name } = params;
    const template = this.templates.welcome;
    const html = template({
      user_name: name,
      user_email: to,
      dashboard_url: `${this.config.baseUrl}/admin?welcome=true&tour=enabled`,
      profile_url: `${this.config.baseUrl}/admin/setup`,
      help_url: `${this.config.baseUrl}/help/getting-started`,
      community_url: `${this.config.baseUrl}/community`,
      company_name: this.config.company.name,
    });

    await this.strategy.send(to, 'Welcome!', html);
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    await this.strategy.send(to, subject, html);
  }
}
