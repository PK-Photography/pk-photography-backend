import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  addComment,
} from "../../controllers/blogController.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/blogs", upload.single("image"), createBlog);
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.put("/blogs/:id", upload.single("image"), updateBlog);
router.delete("/blogs/:id", deleteBlog);
router.patch("/blogs/addComment/:id", addComment);

export default router;
