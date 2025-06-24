import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    author: {
      type: String,
      default: "PK Photography",
    },
    content: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    date: { type: Date },
    comments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;