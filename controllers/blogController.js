import Blog from "../models/blogModel.js";
import cloudinary from "cloudinary";

// CREATE
export const createBlog = async (req, res) => {
  try {
    const { title, subtitle, author, content, date, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.v2.uploader.upload(image, {
        folder: "blogs",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const blog = new Blog({
      title,
      subtitle,
      author,
      content,
      date,
      image: imageUrl,
    });

    await blog.save();
    res.status(201).json({ message: "Blog created", data: blog });
  } catch (error) {
    res.status(500).json({ message: "Error creating blog", error: error.message });
  }
};

// READ ALL
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ data: blogs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error: error.message });
  }
};

// READ SINGLE
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ data: blog });
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error: error.message });
  }
};

// UPDATE
export const updateBlog = async (req, res) => {
  try {
    const { title, subtitle, author, content, date, image } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    let imageUrl = blog.image;

    if (image && image !== blog.image) {
      const uploadResponse = await cloudinary.v2.uploader.upload(image, {
        folder: "blogs",
      });
      imageUrl = uploadResponse.secure_url;
    }

    blog.title = title || blog.title;
    blog.subtitle = subtitle || blog.subtitle;
    blog.author = author || blog.author;
    blog.content = content || blog.content;
    blog.date = date || blog.date;
    blog.image = imageUrl;

    await blog.save();
    res.status(200).json({ message: "Blog updated", data: blog });
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error: error.message });
  }
};

// DELETE
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ message: "Blog deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
};