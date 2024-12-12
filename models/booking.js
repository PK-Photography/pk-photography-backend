import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    service: {
        type: String,
        required: true,
        enum: ["Headshots", "Portrait", "Wedding & Events", "Interior", "Other"], 
    },
    message: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
