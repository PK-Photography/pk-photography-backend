import express from "express";
import {UserSignUp, UserVerifyEmailOTP} from '../../controllers/userController.js'

const router = express.Router();


const testMiddleware = (req, res, next) => {
  console.log(`[Test Middleware Triggered]: ${req.method} ${req.originalUrl}`);
  next();
};

//  ===================|| Auth Routes ||======================
// router.post("/booking/email", sendBookingEmail);
router.post('/user/signup', UserSignUp);
router.post('/user/verify_otp', UserVerifyEmailOTP);







export default router;
