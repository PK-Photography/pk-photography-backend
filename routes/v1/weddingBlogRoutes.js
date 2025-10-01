import express from "express";
import {
  createWeddingBlog,
  getWeddingBlogs,
  getWeddingBlogByType,
  deleteWeddingBlog,
  updateWeddingBlog,
} from "../../controllers/weddingBlogController.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/wedding-blogs",
  upload.fields([{ name: "images" }, { name: "video", maxCount: 1 }]),
  createWeddingBlog
);
router.get("/wedding-blogs", getWeddingBlogs);
router.get("/wedding-blogs/:type", getWeddingBlogByType);
router.put(
  "/wedding-blogs/:id",
  upload.fields([{ name: "images" }, { name: "video", maxCount: 1 }]),
  updateWeddingBlog
);
router.delete("/wedding-blogs/:id", deleteWeddingBlog);
export default router;
