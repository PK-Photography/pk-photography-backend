import mongoose from 'mongoose';

const carouselImageSchema = new mongoose.Schema(
    {
        imageName: {
            type: String,
            // required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        imageType: {
            type: String,
            enum: ['mobile', 'Desktop'],
            default: 'Desktop',
        },
    },
    {
        timestamps: true,
    }
);

const CarouselImage = mongoose.model('CarouselImage', carouselImageSchema);

export default CarouselImage;
