import { Document } from 'mongoose';
import { RecordId } from 'src/types/types';
import dayjs from 'dayjs';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentProvider {
  MONNIFY = 'MONNIFY',
  DOT_AI = 'DOT_AI',
  MOCK = 'MOCK',
}

export enum PaymentType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
}

export enum PaymentCategory {
  ESTATE_CREATION = 'ESTATE_CREATION',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER',
  RENT = 'RENT',
  MAINTENANCE = 'MAINTENANCE',
  SECURITY = 'SECURITY',
  DAMAGES = 'DAMAGES',
  DUES = 'DUES',
  FINE = 'FINE',
}

export enum BillingFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  BIANNUALLY = 'BIANNUALLY',
  ANNUALLY = 'ANNUALLY',
}

export class NonDocumentPayment {
  userId: RecordId;
  estateId?: RecordId;
  subscriptionId?: RecordId;
  paymentConfigurationId?: RecordId;
  amount: number;
  currency: string;
  description: string;
  paymentReference: string;
  provider: PaymentProvider;
  providerReference?: string;
  status: PaymentStatus;
  type: PaymentType;
  category: PaymentCategory;
  customerName: string;
  customerEmail: string;
  checkoutUrl?: string;
  providerData?: Record<string, unknown>;
  // eslint-disable-next-line no-restricted-globals
  paidAt?: Date;
  // eslint-disable-next-line no-restricted-globals
  cancelledAt?: Date;
  // eslint-disable-next-line no-restricted-globals
  failedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  deletedAt?: ReturnType<typeof dayjs>;
  createdAt?: ReturnType<typeof dayjs>;
  updatedAt?: ReturnType<typeof dayjs>;
}

export interface Payment extends Readonly<NonDocumentPayment>, Document {}

export class PaymentSchemaClass extends NonDocumentPayment {
  readonly id: string;

  isSuccessful(): boolean {
    return this.status === PaymentStatus.PAID;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.status === PaymentStatus.CANCELLED;
  }

  isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }
}

export type PaymentDocument = Payment & PaymentSchemaClass;

export type CreatePaymentAttributes = NonDocumentPayment & {
  id?: string;
  _id?: string;
};
