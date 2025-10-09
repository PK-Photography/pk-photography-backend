import mongoose from "mongoose";

const weddingBlogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Engagement",
        "Pre-wedding",
        "Bridal portraits",
        "Couple rituals",
        "Family emotions",
        "Reception",
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    header: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const WeddingBlog = mongoose.model("WeddingBlog", weddingBlogSchema);
export default WeddingBlog;
