import gallary from '../models/gallaryModel.js';

export const uploadgallary = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { imageName, subtitle, categories, position } = req.body;

        // Parse categories if it's a string (i.e., it was stringified on the frontend)
        let parsedCategories = categories;
        if (typeof categories === 'string') {
            parsedCategories = JSON.parse(categories);
        }

        // Validate categories
        if (!parsedCategories || !Array.isArray(parsedCategories) || parsedCategories.length === 0) {
            return res.status(400).json({ message: 'Categories are required and must be an array' });
        }

        const newImage = new gallary({
            imageName,
            subtitle,
            imageUrl: req.file.path,
            categories: parsedCategories,
            position: Number(position) || 0, // fallback to 0 if not provided or invalid
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


// UPDATE: Update a gallery image by ID
export const updategallary = async (req, res) => {
    try {
        const { imageName, subtitle, categories, position } = req.body;
        const updateData = { imageName, subtitle, categories };

        // Validate categories if provided
        if (categories && (!Array.isArray(categories) || categories.length === 0)) {
            return res.status(400).json({ message: 'Categories must be a non-empty array' });
        }

        // Add position if provided
        if (position !== undefined) {
            updateData.position = Number(position) || 0; // fallback to 0 if invalid
        }

        // Check if a new file is uploaded
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        // Debug logs
        console.log("Update Data:", updateData);

        // Find and update the image document
        const updatedImage = await gallary.findByIdAndUpdate(req.params.id, updateData, {
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

// READ: Get all gallery images
export const getgallarys = async (req, res) => {
    const { category } = req.query;

    try {
        let filter = {};

        if (!category) {
            // If no category is provided, show only those with category === 'All'
            filter = { categories: 'All' };
        } else if (category !== 'All') {
            // If a specific category is provided (other than 'All'), filter by it
            filter = { categories: category };
        }
        // else: if category === 'All', keep filter empty to return all items

        const images = await gallary.find(filter).sort({ position: -1 });

        res.status(200).json({ data: images });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error: error.message });
    }
};

// READ: Get a single gallery image by ID
export const getgallaryById = async (req, res) => {
    try {
        const image = await gallary.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.status(200).json({ data: image });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching image', error: error.message });
    }
};



// DELETE: Delete a gallery image by ID
export const deletegallary = async (req, res) => {
    try {
        const deletedImage = await gallary.findByIdAndDelete(req.params.id);

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
