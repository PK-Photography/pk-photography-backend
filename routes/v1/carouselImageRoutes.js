import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { deleteCarouselImage, getCarouselImageById, getCarouselImages, updateCarouselImage, uploadCarouselImage } from './../../controllers/carouselController.js';

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
router.post('/carousel/upload', upload.single('image'), uploadCarouselImage);
router.get('/carousel/all', getCarouselImages);
router.get('/carousel/:id', getCarouselImageById);
router.put('/carousel/update/:id', upload.single('image'), updateCarouselImage);
router.delete('/carousel/delete/:id', deleteCarouselImage);

export default router;
