import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
    },
    email: {
        type: String,
        required: false,
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
        required: false,
        enum: [
            "Headshots",
            "Portrait",
            "Wedding & Events",
            "Interior",
            "Other",
            "silver",
            "gold",
            "platinum",
            "bespoke",
            "consultation",
            ""
        ]
    },
    message: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        required: false,
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
