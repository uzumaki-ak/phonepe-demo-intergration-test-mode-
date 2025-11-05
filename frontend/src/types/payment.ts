export interface PaymentRequest {
  amount: number;
  orderId: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    redirectUrl?: string;
    intentUri?: string;
    transactionId: string;
  };
}