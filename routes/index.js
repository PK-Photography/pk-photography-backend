import express from "express";
import cardRoutes from "./v1/cardRoutes.js";
import bookingRoutes from "./v1/bookingRoutes.js"
import authRoutes from "./v1/authRoutes.js"
import carouselImageRoutes from "./v1/carouselImageRoutes.js"
import userRoutes from "./v1/userRoutes.js"
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

export default router;
