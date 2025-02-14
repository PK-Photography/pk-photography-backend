import express from "express";
import {getProfile, getUserProfile, googleAuth,  googleAuthController,  login, UserForgotPassword, UserResetPassword, UserSignUp, UserVerifyEmailOTP} from '../../controllers/userController.js'
import { checkAuthenticate, verifyUser } from "../../middleware/adminAuthenticate.js";
import { verifyUserToken } from "../../services/authServices.js";

const router = express.Router();


const testMiddleware = (req, res, next) => {
  console.log(`[Test Middleware Triggered]: ${req.method} ${req.originalUrl}`);
  next();
};

//  ===================|| Auth Routes ||======================
// router.post("/booking/email", sendBookingEmail);
router.post('/user/signup',  UserSignUp);
router.post('/user/verify_otp', UserVerifyEmailOTP);
router.post('/user/login', login);
router.post('/user/reset-password', UserResetPassword);
router.post('/user/forgot-password', UserForgotPassword);
router.get('/user/profile', verifyUser ,getUserProfile);


router.get("/google", googleAuth);


router.post("/google-login", googleAuthController);
// Get Profile
router.get("/profile", getProfile);




export default router;
