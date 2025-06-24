import express from "express";
import cardRoutes from "./v1/cardRoutes.js";
import bookingRoutes from "./v1/bookingRoutes.js"
import authRoutes from "./v1/authRoutes.js"
import carouselImageRoutes from "./v1/carouselImageRoutes.js"
import userRoutes from "./v1/userRoutes.js"
import gallaryRoutes from "./v1/gallaryRoutes.js"
import phonepeRoutes from './v1/phonepeRoutes.js';
import blogRoutes from './v1/blogRoutes.js';

const router = express.Router();

router.get("/health-check", (req, res) => {
  res.status(200).json({
    data: "Server health is running",
  });
});

router.use(cardRoutes);
router.use(bookingRoutes);
router.use(authRoutes);
router.use(carouselImageRoutes);
router.use(userRoutes);
router.use(gallaryRoutes);
router.use(phonepeRoutes);
router.use(blogRoutes);

export default router;
