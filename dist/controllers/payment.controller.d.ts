import { CreatePaymentDto } from 'src/dtos/create-payment.dto';
import { PaymentService } from 'src/services/payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    pay(dto: CreatePaymentDto): Promise<{
        status: string;
        paymentIntent: import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>;
    }>;
}
