import express from "express";
import cardRoutes from "./v1/cardRoutes.js";
import bookingRoutes from "./v1/bookingRoutes.js"
import authRoutes from "./v1/authRoutes.js"

const router = express.Router();

router.get("/health-check", (req, res) => {
  res.status(200).json({
    data: "Server health is running",
  });
});

router.use(cardRoutes);
router.use(bookingRoutes);
router.use(authRoutes);

export default router;
