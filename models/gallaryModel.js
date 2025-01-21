import mongoose from 'mongoose';

const gallarySchema = new mongoose.Schema(
    {
        imageName: {
            type: String,
            // required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
       
    },
    {
        timestamps: true,
    }
);

const gallary = mongoose.model('gallary', gallarySchema);

export default gallary;
