import WeddingBlog from "../models/weddingBlog.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getImageUrl } from "../utils/imageService.js";

export const createWeddingBlog = async (req, res) => {
  try {
    const { type, date, header, content } = req.body;
    const files = req.files.images;
    const video = req.files?.video?.[0];
    if (!type || !date || !header || !content) {
      return res
        .status(400)
        .json({ message: "Type,Date, header and content are required" });
    }

    let s3ResultVideo = null;
    let s3ResultImages = null;
    let imageUrls = null;
    if (video) {
      s3ResultVideo = await uploadToS3(video, "weddingBlogsVideos");
    }

    if (files && files.length > 0) {
      s3ResultImages = await Promise.all(
        files.map((file) => uploadToS3(file, "weddingBlogsImages"))
      );

      imageUrls = s3ResultImages.map((result) => result.Key);
    }

    const objToUpload = {};
    objToUpload.type = type.trim();
    objToUpload.date = new Date(date);
    objToUpload.header = header.trim();
    objToUpload.content = content.trim();
    if (s3ResultVideo) objToUpload.videoUrl = s3ResultVideo.Key;
    if (imageUrls) objToUpload.imageUrls = imageUrls;
    const weddingBlog = new WeddingBlog(objToUpload);
    await weddingBlog.save();
    res.status(201).json({
      message: "Wedding blog has been successfully created",
      data: weddingBlog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating wedding blog", error: error.message });
  }
};

export const getWeddingBlogs = async (req, res) => {
  try {
    const weddingBlogs = await WeddingBlog.find();
    const withUrlWeddingBlogs = await Promise.all(
      weddingBlogs.map(async (weddingBlog) => {
        const imageUrls = await Promise.all(
          weddingBlog.imageUrls.map(async (imageUrl) => {
            return await getImageUrl(imageUrl, 10800);
          })
        );

        const videoUrl = weddingBlog.videoUrl
          ? await getImageUrl(weddingBlog.videoUrl, 10800)
          : null;
        const updatedWeddingBlog = {
          ...weddingBlog._doc,
          imageUrls: imageUrls,
          videoUrl: videoUrl,
        };
        return updatedWeddingBlog;
      })
    );

    res.status(200).json(withUrlWeddingBlogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching blogs", error: error.message });
  }
};

export const getWeddingBlogByType = async (req, res) => {
  try {
    const { type } = req.params;
    const weddingBlog = await WeddingBlog.findOne({ type: type });
    if (!weddingBlog)
      return res.status(404).json({ message: "Wedding blog not found" });
    const imageUrls = await Promise.all(
      weddingBlog.imageUrls.map(async (imageUrl) => {
        return await getImageUrl(imageUrl, 10800);
      })
    );
    const videoUrl = weddingBlog.videoUrl
      ? await getImageUrl(weddingBlog.videoUrl, 10800)
      : null;
    const weddingBlogWithUrl = {
      ...weddingBlog._doc,
      imageUrls: imageUrls,
      videoUrl: videoUrl,
    };
    res.status(200).json(weddingBlogWithUrl);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching wedding blog", error: error.message });
  }
};

export const deleteWeddingBlog = async (req, res) => {
  try {
    const deletedWeddingBlog = await WeddingBlog.findByIdAndDelete(
      req.params.id
    );
    if (!deletedWeddingBlog) {
      return res.status(404).json({ message: "Wedding blog not found" });
    }
    res
      .status(200)
      .json({ message: "Wedding blog deleted", data: deletedWeddingBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting wedding blog", error: error.message });
  }
};

export const updateWeddingBlog = async (req, res) => {
  try {
    const { type, date, header, content } = req.body;
    const files = req.files.images;
    const video = req.files?.video?.[0];
    let s3ResultVideo = null;
    let s3ResultImages = null;
    let imageUrls = null;
    if (video) {
      s3ResultVideo = await uploadToS3(video, "weddingBlogsVideos");
    }
    if (files && files.length > 0) {
      s3ResultImages = await Promise.all(
        files.map((file) => uploadToS3(file, "weddingBlogsImages"))
      );
      imageUrls = s3ResultImages.map((result) => result.Key);
    }
    const updatedObj = {};
    if (type) updatedObj.type = type.trim();
    if (date) updatedObj.date = new Date(date);
    if (header) updatedObj.header = header.trim();
    if (content) updatedObj.content = content.trim();
    if (s3ResultVideo) updatedObj.videoUrl = s3ResultVideo.Key;
    if (imageUrls) updatedObj.imageUrls = imageUrls;
    const updatedWeddingBlog = await WeddingBlog.findByIdAndUpdate(
      req.params.id,
      updatedObj,
      { new: true }
    );
    if (!updatedWeddingBlog) {
      return res.status(404).json({ message: "Wedding blog not found" });
    }
    res
      .status(200)
      .json({ message: "Wedding blog updated", data: updatedWeddingBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating wedding blog", error: error.message });
  }
};
