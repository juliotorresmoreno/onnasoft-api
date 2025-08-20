import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface RedisConfiguration {
  url: string;
}

export interface Configuration {
  env: 'development' | 'production';
  port: number;
  secret: string;
  database: TypeOrmModuleOptions;
  redis: RedisConfiguration;
  baseUrl: string;
  defaultLimit: number;
  email: {
    strategy: 'console' | 'resend';
    resendApiKey?: string;
    fromEmail?: string;
    contact?: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    googleApiKey: string;
  };
  company: {
    name: string;
    addressStreet: string;
    addressLine1: string;
    addressLine2: string;
    supportEmail: string;
  };
  embedding: {
    endpoint: string;
  };
}
