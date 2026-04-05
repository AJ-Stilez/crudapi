/**
 *  _____                           _   _
 * |  __ \                         | | (_)
 * | |__) |_ _ _ __   ___ _ __   __| |_ _ _ __   __ _
 * |  ___/ _` | '_ \ / _ \ '_ \ / _` | | | '_ \ / _` |
 * | |  | (_| | | | |  __/ | | | (_| | | | | | | (_| |
 * |_|   \__,_|_| |_|\___|_| |_|\__,_|_|_|_| |_|\__, |
 *                                                __/ |
 *                                               |___/
 *
 * Payment Utilities - The Money Movers
 *
 * @module PaymentUtils
 * @internal
 *
 * 💰 These utilities are like the bankers of your app -
 *    they handle the money with precision and security! 🏦
 */
import {
  PaymentStatus,
  PaymentType,
  PaymentCategory,
} from 'src/schema/class/payment.schema.class';
import dayjs from 'dayjs';

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  paymentReference: string;
  checkoutUrl?: string;
  // Added fields for history display
  type?: PaymentType;
  category?: PaymentCategory;
  paymentMethod?: string;
  createdAt: ReturnType<typeof dayjs>;
  updatedAt: ReturnType<typeof dayjs>;
  // User information (when populated)
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
  // eslint-disable-next-line no-restricted-globals
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

export const generatePaymentReference = (): string => {
  const timestamp = dayjs().valueOf().toString();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `PAY-${timestamp}-${random}`;
};

export const generateTransactionReference = (): string => {
  const timestamp = dayjs().valueOf().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatPaymentResponse = (payment: any): PaymentResponse => {
  const p = payment?.toObject ? payment.toObject() : payment;
  const paymentMethod =
    p?.providerData?.paymentMethod ||
    p?.metadata?.paymentMethod ||
    p?.metadata?.methodUsed ||
    p?.metadata?.method ||
    (Array.isArray(p?.providerData?.paymentMethods) &&
      String(p.providerData.paymentMethods.at(0))) ||
    p?.provider;

  // Extract user information if populated
  const userId = p?.userId;
  const fullName =
    userId && (userId.firstName || userId.lastName)
      ? `${userId.firstName || ''} ${userId.lastName || ''}`.trim()
      : p?.customerName;
  const phone = userId?.phone || undefined;

  return {
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    description: p.description,
    status: p.status,
    paymentReference: p.paymentReference,
    checkoutUrl: p.checkoutUrl,
    type: p.type,
    category: p.category,
    paymentMethod,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    fullName,
    phone,
  };
};

/**
 * Transforms resident due payment response to rename paymentConfigurationId to paymentConfiguration
 * @param payments - Array of resident due payments
 * @returns Transformed payments with renamed field
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformResidentDuePayments = (payments: any[]): any[] => {
  return payments.map((payment) => {
    const paymentObj = payment.toObject ? payment.toObject() : payment;
    const { paymentConfigurationId, ...rest } = paymentObj;
    return {
      ...rest,
      paymentConfiguration: paymentConfigurationId,
    };
  });
};
