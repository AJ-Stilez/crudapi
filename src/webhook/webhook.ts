import { Controller, Post, Req, Headers, HttpCode } from '@nestjs/common';
import express from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Controller()
export class WebhookController {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      {
        apiVersion: '2025-12-15.clover',
      },
    );
  }
  
@Post('webhook')
@HttpCode(200) // always respond 200
handleWebhook(
  @Req() req: express.Request,
  @Headers('stripe-signature') sig: string,
) {
  const isTesting = process.env.NODE_ENV !== 'production';
  let event: any;

  if (isTesting) {
    // Accept raw JSON from Postman
    try {
      event = JSON.parse(req.body);
    } catch {
      return { status: 'error', message: 'Invalid JSON' };
    }
  } else {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!;
    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature failed:', err.message);
      return { status: 'error', message: 'Webhook signature failed' };
    }
  }

  // Handle events and prepare response message
  let message: string;
  switch (event.type) {
    case 'payment_intent.succeeded':
      message = `✅ Payment succeeded: ${JSON.stringify(event.data.object)}`;
      console.log(message);
      break;
    case 'payment_intent.payment_failed':
      message = `❌ Payment failed: ${JSON.stringify(event.data.object)}`;
      console.log(message);
      break;
    case 'checkout.session.completed':
      message = `🛒 Checkout session completed: ${JSON.stringify(event.data.object)}`;
      console.log(message);
      break;
    default:
      message = `Unhandled event type: ${event.type}`;
      console.log(message);
  }

  // Return a response to Stripe/Postman
  return { status: 'success', message: event.data.object };
}
}
