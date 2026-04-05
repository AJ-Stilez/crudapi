import { PaymentStatus, PaymentType, PaymentCategory } from 'src/schema/class/payment.schema.class';
import dayjs from 'dayjs';
export interface PaymentResponse {
    id: string;
    amount: number;
    currency: string;
    description: string;
    status: PaymentStatus;
    paymentReference: string;
    checkoutUrl?: string;
    type?: PaymentType;
    category?: PaymentCategory;
    paymentMethod?: string;
    createdAt: ReturnType<typeof dayjs>;
    updatedAt: ReturnType<typeof dayjs>;
    fullName?: string;
    phone?: string;
}
export interface PaymentVerificationResponse {
    status: PaymentStatus;
    message: string;
    data?: {
        amount: number;
        currency: string;
        paidAt: ReturnType<typeof dayjs>;
        paymentReference: string;
        providerReference: string;
    };
}
export interface WebhookResponse {
    success: boolean;
    message: string;
}
export interface OverduePaymentItem {
    id: string;
    amount: number;
    currency: string;
    dueDate: Date;
    status: string;
    residentId?: string;
    estateId?: string;
}
export interface MonthlyTrendItem {
    month: string;
    amount: number;
}
export interface OverduePaymentsResponse {
    totalAmount: number;
    currency: string;
    payments: OverduePaymentItem[];
    monthlyTrend: MonthlyTrendItem[];
}
export declare const generatePaymentReference: () => string;
export declare const generateTransactionReference: () => string;
export declare const formatPaymentResponse: (payment: any) => PaymentResponse;
export declare const transformResidentDuePayments: (payments: any[]) => any[];
