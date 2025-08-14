// routes/careerRoutes.js
import express from "express";
import {
  submitCareerApplication,
  getApplications,
  updateStatus,
  getResume,
} from "../../controllers/careerController.js";
import upload from "../../middleware/uploadMiddleware.js";
const router = express.Router();

router.post(
  "/careers/submit",
  upload.single("resume"),
  submitCareerApplication
);

router.get("/careers", getApplications);

router.put("/careers/:id/status", updateStatus);

router.get("/careers/resume-url/:key", getResume);

export default router;
