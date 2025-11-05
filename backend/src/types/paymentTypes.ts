export interface PaymentInitRequest {
  amount: number;
  orderId: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface PhonePeChargeRequest {
  merchantId: string;
  merchantTransactionId: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  callbackUrl?: string;
  mobileNumber: string;
  paymentInstrument: {
    type: string;
  };
}

export interface PhonePeResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse?: {
      type: string;
      redirectInfo: {
        url: string;
        method: string;
      };
    };
    redirectUrl?: string;
    intentUri?: string;
  };
}

export interface WebhookPayload {
  event: string;
  data: {
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
  };
}