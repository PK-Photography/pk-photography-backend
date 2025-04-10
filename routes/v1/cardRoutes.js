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
  // getCardBySlug,
} from "../../controllers/cardController.js";

import { sendOtp, verifyOtp, googleAuth } from "../../controllers/authController.js";
// import { sendBookingEmail } from "../controllers/bookingController.js";

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

router.get("/client/cards", getCardsByClientId);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google-auth", googleAuth);

// Define the route for downloading files
router.get('/download/:fileId', downloadFile);

// router.get('/cards/slug/:slug', getCardBySlug);
//  ===================|| Booking Routes ||======================



export default router;
