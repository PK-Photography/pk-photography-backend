import express from "express";
import upload from "../../middleware/uploadMiddleware.js";
import {
  createTalent,
  getApprovedTalents,
  getUnapprovedTalents,
  getTalentById,
  updateTalent,
  deleteTalent,
  updateStatus,
} from "../../controllers/talentController.js";

const router = express.Router();

router.post("/talents", upload.single("image"), createTalent);
router.get("/talents/approved", getApprovedTalents);
router.get("/talents/unapproved", getUnapprovedTalents);
router.get("/talents/:id", getTalentById);
router.put("/talents/:id", upload.single("image"), updateTalent);
router.put("/talents/changeStatus/:id", updateStatus);
router.delete("/talents/:id", deleteTalent);

export default router;
