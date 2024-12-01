import express from "express";
import {
  uploadCard,
  getCards,
  createCard,
  getCardById,
  uploadCardByCategory,
  getCardsByClientId,
  UpdateCardWithDriveLink,
  deleteCard,
  deleteCategory,
  updateCategory,
  downloadFile,
} from "../controllers/cardController.js";

import { sendOtp, verifyOtp, googleAuth } from "../controllers/authController.js";

const router = express.Router();

// Route to upload a card
router.post("/upload", uploadCard);

router.delete('/cards/:id', deleteCard);

router.delete('/cards/delete-category', deleteCategory);

// Route to get all cards
router.get("/cards", getCards);

// Route to create a new card
router.post("/cards", createCard);

// Route to get a specific card by ID
router.get("/cards/:id", getCardById);

router.post("/cards/category", uploadCardByCategory);

// router.post("/cards/drive-upload", uploadCardWithDriveLink);

router.put("/cards/drive-update", UpdateCardWithDriveLink);

router.put("/cards/update-category", updateCategory);

router.get("/client/cards", getCardsByClientId);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google-auth", googleAuth);

// Define the route for downloading files
router.get('/download/:fileId', downloadFile);

export default router;
