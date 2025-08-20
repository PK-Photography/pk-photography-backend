import express from "express";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../controllers/serviceController.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/services", getServices);
router.post("/services", upload.single("file"), createService);
router.put("/services/:id", upload.single("file"), updateService);
router.delete("/services/:id", deleteService);

export default router;
