import mongoose from 'mongoose';

const gallarySchema = new mongoose.Schema(
    {
        imageName: {
            type: String,
            // required: true,
        },
        subtitle: {
            type: String,
            // required: true,
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
    },
    {
        timestamps: true,
    }
);

const gallary = mongoose.model('gallary', gallarySchema);

export default gallary;
