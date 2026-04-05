import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class PaymentService {
    private readonly configService;
    private readonly stripe;
    constructor(configService: ConfigService);
    createPayment(amount: number, currency: string, paymentMethodId?: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
}
