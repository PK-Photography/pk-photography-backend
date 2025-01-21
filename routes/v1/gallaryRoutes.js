import express from 'express';
import pkg from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
    deletegallary,
    getgallaryById,
    getgallarys,
    updategallary,
    uploadgallary,
} from './../../controllers/gallaryController.js';

// Destructure v2 from the default export of cloudinary
const { v2: cloudinary } = pkg;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'carousel-images', // Folder in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage });

const router = express.Router();

// Upload route
router.post('/gallery/upload', upload.single('image'), uploadgallary);
router.get('/gallery/all', getgallarys);
router.get('/gallery/:id', getgallaryById);
router.put('/gallery/update/:id', upload.single('image'), updategallary);
router.delete('/gallery/delete/:id', deletegallary);

export default router;
