import { uploadToS3 } from "../utils/uploadToS3.js";
import { getImageUrl } from "../utils/imageService.js";
import Talent from "../models/talent.js";

export const createTalent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      talent,
      portfolioUrl,
      experience,
      message,
      approved,
    } = req.body;
    const file = req.file;

    if (!name || !email || !phone || !city || !talent || !message) {
      return res
        .status(400)
        .json({ message: "All required fields are not present" });
    }
    if (!file) {
      return res.status(400).json({ message: "Image is not present" });
    }

    const s3Result = await uploadToS3(file, "talents");

    const objToUpload = {};
    objToUpload.name = name.trim();
    objToUpload.email = email.trim();
    objToUpload.phone = phone.trim();
    objToUpload.city = city.trim();
    objToUpload.talent = talent.trim();
    objToUpload.message = message.trim();
    objToUpload.imageUrl = s3Result.Key;
    if (portfolioUrl) objToUpload.portfolioUrl = portfolioUrl.trim();
    if (experience) objToUpload.experience = experience.trim();
    if (approved) objToUpload.approved = approved;

    const createdTalent = new Talent(objToUpload);

    await createdTalent.save();

    res
      .status(201)
      .json({ message: "Talent Saved Successfully", data: createTalent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving talent", error: error.message });
  }
};

export const getApprovedTalents = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    query.approved = true;
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const talents = await Talent.find(query).sort({
      createdAt: 1,
    });
    const withUrlTalents = await Promise.all(
      talents.map(async (talent) => {
        const imageUrl = await getImageUrl(talent.imageUrl, 10800);
        const updatedTalent = { ...talent._doc, imageUrl: imageUrl };
        return updatedTalent;
      })
    );

    res.status(200).json(withUrlTalents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching talents", error: error.message });
  }
};

export const getUnapprovedTalents = async (req, res) => {
  try {
    const talents = await Talent.find({ approved: false }).sort({
      createdAt: 1,
    });
    const withUrlTalents = await Promise.all(
      talents.map(async (talent) => {
        const imageUrl = await getImageUrl(talent.imageUrl, 10800);
        const updatedTalent = { ...talent._doc, imageUrl: imageUrl };
        return updatedTalent;
      })
    );

    res.status(200).json(withUrlTalents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching talents", error: error.message });
  }
};

export const getTalentById = async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.id);
    if (!talent) return res.status(404).json({ message: "Talent not found" });
    const imageUrl = await getImageUrl(talent.imageUrl, 10800);
    const updatedTalent = { ...talent._doc, imageUrl: imageUrl };
    res.status(200).json(updatedTalent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching talent", error: error.message });
  }
};

export const updateTalent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      talent,
      portfolioUrl,
      experience,
      message,
    } = req.body;
    const file = req.file;

    let s3Result = null;

    if (file) {
      s3Result = await uploadToS3(file, "talents");
    }

    const updatedObj = {};
    if (name) updatedObj.name = name.trim();
    if (email) updatedObj.email = email.trim();
    if (phone) updatedObj.phone = phone.trim();
    if (city) updatedObj.city = city.trim();
    if (talent) updatedObj.talent = talent.trim();
    if (message) updatedObj.message = message.trim();
    if (portfolioUrl) updatedObj.portfolioUrl = portfolioUrl.trim();
    if (experience) updatedObj.experience = experience.trim();
    if (s3Result) updatedObj.imageUrl = s3Result.Key;

    const updatedTalent = await Talent.findByIdAndUpdate(
      req.params.id,
      updatedObj,
      { new: true }
    );

    if (!updatedTalent) {
      return res.status(404).json({ message: "Talent not found" });
    }

    res
      .status(200)
      .json({ message: "Talent updated successfully", data: updatedTalent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating talent", error: error.message });
  }
};

export const deleteTalent = async (req, res) => {
  try {
    const deleted = await Talent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Talent not found" });
    res
      .status(200)
      .json({ message: "Talent deleted successfully", data: deleted });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting talent", error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { approved } = req.body;
    if (approved === undefined || approved === null) {
      return res.status(400).json({ message: " Status is required" });
    }
    const updatedTalent = await Talent.findByIdAndUpdate(
      req.params.id,
      { approved: approved },
      { new: true }
    );
    if (!updatedTalent) {
      return res.status(404).json({ message: "Talent not found" });
    }
    res
      .status(200)
      .json({ message: "Talent status updated", data: updatedTalent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};
