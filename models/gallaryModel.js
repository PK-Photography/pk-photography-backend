import mongoose from 'mongoose';

const gallarySchema = new mongoose.Schema(
    {
        imageName: {
            type: String,
        },
        subtitle: {
            type: String,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        categories: {
            type: [String],
            enum: [
                'All',
                'Portfolio',
                'Portrait',
                'Headshots',
                'Editorial',
                'Celebrity',
                'Ads',
                'Wedding',
                'Boudoir',
                'E-Commerce',
                'Food',
                'Real Estate',
                'Design',
            ],
            required: true,
        },
        position: {
            type: Number,
            default: 0, // optional default value
        },
    },
    {
        timestamps: true,
    }
);

const gallary = mongoose.model('gallary', gallarySchema);

export default gallary;