// routes/careerRoutes.js
import express from 'express';
import multer from 'multer';
import { submitCareerApplication } from '../controllers/careerController.js';

const router = express.Router();
const upload = multer();

router.post('/careers/submit', upload.single('resume'), submitCareerApplication);

export default router;