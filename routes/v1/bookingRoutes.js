import express from "express";
import {
  createBooking,
  getAllBookings,
  getBooking,
  deleteBooking,
  editBooking,
} from '../../controllers/bookingController.js';
import { checkAuthenticate } from "../../middleware/adminAuthenticate.js";

const router = express.Router();


const testMiddleware = (req, res, next) => {
  console.log(`[Test Middleware Triggered]: ${req.method} ${req.originalUrl}`);
  next();
};

//  ===================|| Booking Routes ||======================
// router.post("/booking/email", sendBookingEmail);
router.post('/booking/request', createBooking);

// Get all bookings
router.get('/booking/all', checkAuthenticate, getAllBookings);


// Get a single booking
router.get('/booking/:id', checkAuthenticate, getBooking);

// edit booking 
router.put('/booking/:id', checkAuthenticate, editBooking);

// Delete a booking
router.delete('/booking/:id', checkAuthenticate, deleteBooking);






export default router;
