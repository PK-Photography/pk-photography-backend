// routes/careerRoutes.js
import express from "express";
import { submitCareerApplication } from "../../controllers/careerController.js";
import upload from "../../middleware/uploadMiddleware.js";
const router = express.Router();

router.post(
  "/careers/submit",
  upload.single("resume"),
  submitCareerApplication
);

export default router;
