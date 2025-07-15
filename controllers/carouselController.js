import CarouselImage from '../models/carouselImage.js';

// UPLOAD: Upload a carousel image
export const uploadCarouselImage = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { imageName, imageType = 'Desktop' } = req.body;

        const newImage = new CarouselImage({
            imageName,
            imageUrl: req.file.path,
            imageType,
        });

        await newImage.save();

        res.status(201).json({
            message: 'Image uploaded successfully',
            data: newImage,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

// READ: Get all carousel images
export const getCarouselImages = async (req, res) => {
    try {
        const images = await CarouselImage.find();
        res.status(200).json({ data: images });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error: error.message });
    }
};

// READ: Get a single carousel image by ID
export const getCarouselImageById = async (req, res) => {
    try {
        const image = await CarouselImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.status(200).json({ data: image });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching image', error: error.message });
    }
};

// UPDATE: Update a carousel image by ID
export const updateCarouselImage = async (req, res) => {
    try {
        const { imageName, imageType = 'Desktop' } = req.body;
        const updateData = { imageName, imageType };  // Include imageType in the update data

        // Check if a new file is uploaded
        if (req.file) {
            updateData.imageUrl = req.file.path; // Cloudinary URL of the new image
        }

        // Debug logs
        console.log("Update Data:", updateData);

        // Find and update the image document
        const updatedImage = await CarouselImage.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.status(200).json({
            message: 'Image updated successfully',
            data: updatedImage,
        });
    } catch (error) {
        console.error("Error updating image:", error.message);
        res.status(500).json({ message: 'Error updating image', error: error.message });
    }
};

// DELETE: Delete a carousel image by ID
export const deleteCarouselImage = async (req, res) => {
    try {
        const deletedImage = await CarouselImage.findByIdAndDelete(req.params.id);

        if (!deletedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.status(200).json({
            message: 'Image deleted successfully',
            data: deletedImage,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
};
