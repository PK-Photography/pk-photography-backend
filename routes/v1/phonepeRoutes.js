import express from 'express';
import {
  initiatePayment,
  paymentCallback,
  checkStatus,
} from './../../controllers/phonepeController.js';

const router = express.Router();

router.post('/phonepe/initiate', initiatePayment);
router.post('/phonepe/callback', paymentCallback);
router.get('/phonepe/status/:transactionId', checkStatus);

export default router;