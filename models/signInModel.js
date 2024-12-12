import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, expires: 300, default: Date.now }, 
});

export default mongoose.model('Otp', OtpSchema);
