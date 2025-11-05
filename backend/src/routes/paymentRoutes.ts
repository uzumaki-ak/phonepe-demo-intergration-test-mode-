import { Router } from 'express';
import {
  initiatePayment,
  checkPaymentStatus,
  handleWebhook,
  healthCheck
} from '../controllers/paymentController.js';

const router = Router();

router.get('/health', healthCheck);
router.post('/initiate', initiatePayment);
router.get('/status/:transactionId', checkPaymentStatus);
router.post('/webhook', handleWebhook);

export default router;