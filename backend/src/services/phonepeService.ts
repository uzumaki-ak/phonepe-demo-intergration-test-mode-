import { generateChecksum, encodeToBase64 } from '../utils/checksum.js';
import { PhonePeChargeRequest, PhonePeResponse } from '../types/paymentTypes.js';

export class PhonePeService {
  private baseUrl: string;
  private merchantId: string;
  private saltKey: string;
  private saltIndex: number;
  private clientId: string;
  private clientSecret: string;
  private redirectUrl: string;

  constructor() {
    // Loading environment variables directly
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || '';
    this.saltKey = process.env.PHONEPE_SALT_KEY || '';
    this.saltIndex = parseInt(process.env.PHONEPE_SALT_INDEX || '');
    this.clientId = process.env.PHONEPE_CLIENT_ID || '';
    this.clientSecret = process.env.PHONEPE_CLIENT_SECRET || 'ZGE1ZTU5MjctNjdiZi00OGU0LTliNTAtMmQ3YmI4NGY4NTEy';
    this.baseUrl = process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || 'http://localhost:3000/payment-callback';

    console.log(' PhonePe Service Initialized:');
    console.log('   Merchant ID:', this.merchantId);
    console.log('   Base URL:', this.baseUrl);
    console.log('   Client ID:', this.clientId);
  }

  /**
   * Initiate payment with PhonePe
   */
  async initiatePayment(amount: number, orderId: string, customerPhone: string, customerEmail?: string): Promise<PhonePeResponse> {
    try {
      const apiPath = '/pg/v1/pay';
      
      const payload: PhonePeChargeRequest = {
        merchantId: this.merchantId,
        merchantTransactionId: orderId,
        amount: amount * 100, 
        currency: 'INR',
        redirectUrl: this.redirectUrl,
        callbackUrl: process.env.PHONEPE_CALLBACK_URL,
        mobileNumber: customerPhone,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // Encodeing payload to base64
      const base64Payload = encodeToBase64(payload);
      
      // Generating checksum
      const checksum = generateChecksum(base64Payload, apiPath, this.saltKey);

      const requestBody = {
        request: base64Payload
      };

      console.log('Calling PhonePe API...');
      console.log('   URL:', `${this.baseUrl}${apiPath}`);
      console.log('   Merchant ID:', this.merchantId);
      console.log('   Amount:', amount * 100, 'paise');
      console.log('   Order ID:', orderId);

      const response = await fetch(`${this.baseUrl}${apiPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}###${this.saltIndex}`,
          'X-CLIENT-ID': this.clientId,
          'X-CLIENT-SECRET': this.clientSecret,
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(' PhonePe API Response Status:', response.status);

      const data = await response.json();
      
      console.log(' PhonePe API Response:', JSON.stringify(data, null, 2));

      return {
        success: data.success || false,
        code: data.code || 'UNKNOWN_ERROR',
        message: data.message || 'Payment initiation response',
        data: data.data
      };

    } catch (error: any) {
      console.error(' PhonePe API Error:', error.message);
      console.error('   Error details:', error);
      
      return {
        success: false,
        code: 'API_ERROR',
        message: `PhonePe API error: ${error.message}`,
      };
    }
  }

  /**
   * Checking payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<PhonePeResponse> {
    try {
      const apiPath = `/pg/v1/status/${this.merchantId}/${transactionId}`;
      const checksum = generateChecksum('', apiPath, this.saltKey);

      console.log(' Checking payment status...');
      console.log('   Path:', apiPath);

      const response = await fetch(`${this.baseUrl}${apiPath}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}###${this.saltIndex}`,
          'X-CLIENT-ID': this.clientId,
          'X-CLIENT-SECRET': this.clientSecret,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      console.log(' Status API Response:', JSON.stringify(data, null, 2));

      return {
        success: data.success || false,
        code: data.code || 'UNKNOWN_ERROR',
        message: data.message || 'Status check response',
        data: data.data
      };

    } catch (error: any) {
      console.error(' Status check error:', error.message);
      return {
        success: false,
        code: 'API_ERROR',
        message: `Status check error: ${error.message}`,
      };
    }
  }
}

export default new PhonePeService();