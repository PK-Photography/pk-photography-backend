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
  updateClintsCard,
  deleteCardCategory
} from "../../controllers/cardController.js";

import { sendOtp, verifyOtp, googleAuth } from "../../controllers/authController.js";

import { fetchImagesFromNAS, serveNASImage, downloadNASImage } from "../../controllers/nasController.js";

const router = express.Router();

// Route to upload a card
router.post("/upload", uploadCard);
router.put("/card/update/:id", updateClintsCard);
router.post("/card/create", uploadCard);

router.delete('/cards/:id', deleteCard);

router.delete('/cards/delete-category', deleteCategory);

// Route to get all cards
router.get("/cards", getCards);

router.get("/nas-images", fetchImagesFromNAS);
router.get("/pk-photography-images", serveNASImage);
router.get("/nas-download", downloadNASImage);

// Route to create a new card
router.post("/cards", createCard);

// Route to get a specific card by ID
router.get("/cards/:id", getCardById);

router.post("/cards/category", uploadCardByCategory);

router.put("/cards/drive-update", UpdateCardWithDriveLink);

router.put("/cards/update-category", updateCategory);
router.put("/cards/delete-category", deleteCardCategory);

router.get("/client/cards", getCardsByClientId);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google-auth", googleAuth);

router.get('/download/:fileId', downloadFile);


export default router;
