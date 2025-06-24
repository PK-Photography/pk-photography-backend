// controllers/careerController.js
import CareerApplication from './models/CareerApplication.js';
import { uploadToS3 } from '../utils/uploadToS3.js'; // utility to upload file to S3

export const submitCareerApplication = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'Resume file is required' });

    const s3Result = await uploadToS3(file);

    const application = new CareerApplication({
      name,
      email,
      phone,
      resumeUrl: s3Result.Location,
    });

    await application.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};