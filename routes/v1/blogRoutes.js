import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} from "../../controllers/blogController.js";

const router = express.Router();

router.post("/blogs", createBlog);
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

export default router;