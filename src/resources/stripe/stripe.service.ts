import { Configuration } from '@/types/configuration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const stripeConf = this.configService.get<Configuration>('config')?.stripe;
    if (!stripeConf?.secretKey) {
      throw new Error('Stripe secret key is not configured');
    }

    this.stripe = new Stripe(stripeConf.secretKey, {
      appInfo: {
        name: 'OnnaSoft',
        version: '1.0.0',
        url: 'https://onnasoft.us',
      },
      typescript: true,
    });
  }

  async createCustomer(email: string) {
    return this.stripe.customers.create({ email });
  }

  async createCheckoutSession(params: { customerId: string; priceId: string }) {
    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
    });
  }

  async getCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId);
  }

  async handleWebhook(payload: Buffer, sig: string) {
    const stripeConf = this.configService.get<Configuration>('config')?.stripe;
    if (!stripeConf?.webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }
    const secret = stripeConf.webhookSecret;
    return this.stripe.webhooks.constructEvent(payload, sig, secret);
  }
}
