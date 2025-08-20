import { Configuration } from '@/types/configuration';
import { registerAs } from '@nestjs/config';

const acceptableEnvironments = ['development', 'production'];

export default registerAs('config', (): Configuration => {
  const env = process.env.NODE_ENV ?? 'development';
  return {
    env: acceptableEnvironments.includes(env) ? (env as any) : 'development',
    port: parseInt(process.env.PORT ?? '3200', 10),
    secret: process.env.SECRET_KEY!,
    baseUrl: process.env.BASE_URL!,
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT ?? '10', 10),
    database: {
      type: process.env.DB_DRIVER as any,
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_SSL === 'true',
      extra: {
        ssl:
          process.env.DB_EXTRA_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
      },
    },
    redis: {
      url: process.env.REDIS_URL!,
    },
    email: {
      strategy:
        (process.env.EMAIL_STRATEGY as 'console' | 'resend') || 'console',
      resendApiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL,
      contact: process.env.CONTACT_EMAIL || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
      googleApiKey: process.env.GOOGLE_API_KEY!,
    },
    company: {
      name: process.env.COMPANY_NAME || 'TechFlow Solutions',
      addressStreet:
        process.env.COMPANY_ADDRESS_STREET ||
        'Av. Innovación 456, Torre Empresarial, Piso 12',
      addressLine1:
        process.env.COMPANY_ADDRESS_LINE1 ||
        'Calle Tecnología 123, Edificio Alpha',
      addressLine2: process.env.COMPANY_ADDRESS_LINE2 || '28020 Madrid, España',
      supportEmail: process.env.COMPANY_SUPPORT_EMAIL || '',
    },
    embedding: {
      endpoint: process.env.EMBEDDING_ENDPOINT || 'http://localhost:8001/embed',
    },
  };
});
