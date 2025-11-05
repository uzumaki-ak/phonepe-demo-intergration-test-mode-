import { Request, Response } from 'express';
import phonePeService from '../services/phonepeService.js';
import { PhonePeResponse } from '../types/paymentTypes.js';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, orderId, customerPhone, customerEmail } = req.body;

    // input validation
    if (!amount || !orderId || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, orderId, customerPhone'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be > 0'
      });
    }

    console.log(' initiating REAL PhonePe payment...');

    const result: PhonePeResponse = await phonePeService.initiatePayment(
      amount, 
      orderId, 
      customerPhone, 
      customerEmail
    );

    console.log('Backend sending response:', JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      // extracting the redirect URL from phonepe response
      const redirectUrl = result.data.instrumentResponse?.redirectInfo?.url;
      
      if (redirectUrl) {
        res.json({
          success: true,
          message: result.message,
          data: {
            redirectUrl: redirectUrl,
            transactionId: result.data.merchantTransactionId || orderId,
            orderId: orderId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'No redirect URL received from phonepe',
          data: result.data
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        code: result.code
      });
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during payment initiation'
    });
  }
};

export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const result = await phonePeService.checkPaymentStatus(transactionId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        code: result.code
      });
    }

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during status check'
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-verify'] as string;
    
    console.log('Webhook received from PhonePe:', {
      signature: signature ? 'present' : 'missing',
      body: req.body
    });

    // Processing the webhook data
    const webhookData = req.body;
    
    console.log(' Payment webhook data:', JSON.stringify(webhookData, null, 2));

    // Handling PhonePe webhook format
    if (webhookData.event === 'pg.order.completed' || webhookData.event === 'pg.order.failed') {
      console.log(' Payment status update:', webhookData);
      
      const transactionData = webhookData.data;
      console.log('💳 Transaction details:', {
        transactionId: transactionData.merchantTransactionId,
        status: transactionData.state,
        amount: transactionData.amount,
        code: transactionData.responseCode
      });
      
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error: any) {
    console.error(' Webhook processing error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed but acknowledged'
    });
  }
};

export const healthCheck = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Payment service is running',
    timestamp: new Date().toISOString()
  });
};