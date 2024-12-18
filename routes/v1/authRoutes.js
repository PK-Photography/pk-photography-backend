import express from "express";

// import { sendBookingEmail } from "../controllers/bookingController.js";

import { loginAdmin, signUp } from "../../controllers/adminAuthController.js";


const router = express.Router();

//  ===================|| Admin Routes ||======================
// router.post("/booking/email", sendBookingEmail);
router.post('/admin/signup', signUp);

// Get all bookings
router.post('/admin/login', loginAdmin);



export default router;
