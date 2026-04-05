import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentDto } from 'src/dtos/create-payment.dto';
import { PaymentService } from 'src/services/payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async pay(@Body() dto: CreatePaymentDto) {
  const paymentIntent =  await this.paymentService.createPayment(
        dto.amount,
        dto.currency,
        // dto.paymentMethodId,
    )
      return {status: 'success', paymentIntent};
  }

}
