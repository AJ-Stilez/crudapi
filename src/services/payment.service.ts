import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(secretKey, { apiVersion: '2025-12-15.clover' });
  }

  async createPayment(amount: number, currency: string, paymentMethodId?: string ) {
   const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        // payment_method: paymentMethodId,
        // confirm: true,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
        }
    });
    return paymentIntent;
  }
}
