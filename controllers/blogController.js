import Blog from "../models/blogModel.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getImageUrl } from "../utils/imageService.js";

// CREATE
export const createBlog = async (req, res) => {
  try {
    const { title, subtitle, author, content } = req.body;
    const file = req.file;

    if (!title || !subtitle || !content) {
      return res
        .status(400)
        .json({ message: "Title, subtitle and content are required" });
    }

    let s3Result = null;

    if (file) {
      s3Result = await uploadToS3(file, "blogs");
    }

    const objToUpload = {};
    objToUpload.title = title.trim();
    objToUpload.subtitle = subtitle.trim();
    objToUpload.content = content.trim();
    if (author) objToUpload.author = author.trim();
    if (s3Result) objToUpload.imageUrl = s3Result.Key;

    const blog = new Blog(objToUpload);

    await blog.save();
    res
      .status(201)
      .json({ message: "Blog has been successfully created", data: blog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating blog", error: error.message });
  }
};

// READ ALL
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    const withUrlBlogs = await Promise.all(
      blogs.map(async (blog) => {
        const imageUrl = await getImageUrl(blog.imageUrl, 10800);
        const updatedBlog = { ...blog._doc, imageUrl: imageUrl };
        return updatedBlog;
      })
    );
    res.status(200).json(withUrlBlogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching blogs", error: error.message });
  }
};

// READ SINGLE
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    await updateViews(req, res);
    const imageUrl = await getImageUrl(blog.imageUrl, 10800);
    const blogWithUrl = { ...blog._doc, imageUrl: imageUrl };
    res.status(200).json(blogWithUrl);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching blog", error: error.message });
  }
};

// UPDATE
export const updateBlog = async (req, res) => {
  try {
    const { title, subtitle, author, content } = req.body;
    const file = req.file;

    let s3Result = null;

    if (file) {
      s3Result = await uploadToS3(file, "blogs");
    }

    const updatedObj = {};
    if (title) updatedObj.title = title.trim();
    if (subtitle) updatedObj.subtitle = subtitle.trim();
    if (author) updatedObj.author = author.trim();
    if (content) updatedObj.content = content.trim();
    if (s3Result) updatedObj.imageUrl = s3Result.Key;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updatedObj,
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog updated", data: updateBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating blog", error: error.message });
  }
};

// DELETE
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ message: "Blog deleted", data: deleted });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting blog", error: error.message });
  }
};

const updateViews = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    blog.views += 1;
    await blog.save();
  } catch (error) {
    console.log("Error updating views:", error.message);
  }
};

export const addComment = async (req, res) => {
  try {
    const { name, comment } = req.body;
    if (!name || name.trim() === "" || !comment || comment.trim() === "") {
      return res
        .status(400)
        .json({ message: "Name or Comment cannot be empty" });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    blog.comments.push({
      name: name.trim(),
      comment: comment.trim(),
    });
    await blog.save();
    res.status(200).json({ message: "Comment added", data: blog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

export const topPicks = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ views: -1 }).limit(3);
    if (!blogs) return res.status(404).json({ message: "No blogs found" });
    res.status(200).json(blogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching top picks", error: error.message });
  }
};
