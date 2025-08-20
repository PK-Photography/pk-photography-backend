import express from "express";
import {
  getSubServices,
  createSubService,
  updateSubService,
  deleteSubService,
} from "../../controllers/subServiceController.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/subServices", getSubServices);
router.post("/subServices", upload.single("file"), createSubService);
router.put("/subServices/:id", upload.single("file"), updateSubService);
router.delete("/subServices/:id", deleteSubService);

export default router;
