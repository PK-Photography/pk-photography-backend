import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} from "../../controllers/blogController.js";

const router = express.Router();

router.post("/blogs", createBlog);           // no multer needed
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.put("/blogs/:id", updateBlog);        // no multer needed
router.delete("/blogs/:id", deleteBlog);

export default router;