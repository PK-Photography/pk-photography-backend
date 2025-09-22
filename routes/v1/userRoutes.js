import express from "express";
import {
  getAllUsers,
  getProfile,
  getUserProfile,
  googleAuth,
  googleAuthController,
  login,
  updateUserRole,
  UserForgotPassword,
  UserResetPassword,
  UserSignUp,
  GoogleSignUp,
  UserVerifyEmailOTP,
  addFavourite,
  removeFavourite,
  getFavourites,
} from "../../controllers/userController.js";
import {
  checkAuthenticate,
  verifyUser,
} from "../../middleware/adminAuthenticate.js";
import { verifyUserToken } from "../../services/authServices.js";

const router = express.Router();

const testMiddleware = (req, res, next) => {
  console.log(`[Test Middleware Triggered]: ${req.method} ${req.originalUrl}`);
  next();
};

//  ===================|| Auth Routes ||======================
// router.post("/booking/email", sendBookingEmail);
router.post("/user/signup", UserSignUp);
router.post("/user/google-signup", GoogleSignUp);
router.post("/user/verify_otp", UserVerifyEmailOTP);
router.post("/user/login", login);
router.post("/user/reset-password", UserResetPassword);
router.post("/user/forgot-password", UserForgotPassword);
router.get("/user/profile", verifyUser, getUserProfile);
router.get("/user/all", getAllUsers);
router.put("/user/update-role", updateUserRole);
router.put("/user/addFavourite", addFavourite);
router.put("/user/removeFavourite", removeFavourite);
router.get("/user/getFavourites/:userId", getFavourites);

router.get("/google", googleAuth);

router.post("/google-login", googleAuthController);
// Get Profile
router.get("/profile", getProfile);

export default router;
