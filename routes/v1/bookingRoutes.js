import express from "express";
import {
  createBooking,
  getAllBookings,
  getBooking,
  deleteBooking,
} from '../../controllers/bookingController.js';
import { checkAuthenticate } from "../../middleware/adminAuthenticate.js";

const router = express.Router();

//  ===================|| Booking Routes ||======================
// router.post("/booking/email", sendBookingEmail);
router.post('/booking/request', createBooking);

// Get all bookings
router.get('/booking/all', checkAuthenticate, getAllBookings);

// Get a single booking
router.get('/booking/:id', getBooking);

// Delete a booking
router.delete('/booking/:id', checkAuthenticate, deleteBooking);

export default router;
