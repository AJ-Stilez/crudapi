import { Module } from '@nestjs/common';
import { PaymentController } from "src/controllers/payment.controller";
import { PaymentService } from "src/services/payment.service";

@Module({
    controllers: [PaymentController],
    providers: [PaymentService]
})

export class PaymentModule {}