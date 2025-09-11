// controllers/careerController.js
import CareerApplication from "../models/careerApplication.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import s3 from "../utils/s3Config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { sendCareerEmail } from "../services/nodeMailerService2.js";

export const submitCareerApplication = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const file = req.file;

    if (!file)
      return res.status(400).json({ error: "Resume file is required" });

    const s3Result = await uploadToS3(file, "resumes");

    const application = new CareerApplication({
      name,
      email,
      phone,
      resumeUrl: s3Result.Key,
    });

    await application.save();
    await sendCareerEmail(application);
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit application" });
  }
};

export const getApplications = async (req, res) => {
  try {
    const applications = await CareerApplication.find();
    res.status(200).json(applications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await CareerApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to update status" });
  }
};

export const getResume = async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: req.params.key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.status(200).json({ signedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
};
