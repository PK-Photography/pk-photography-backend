// models/CareerApplication.js
import mongoose from 'mongoose';

const careerApplicationSchema = new mongoose.Schema({
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
  resumeUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const CareerApplication =
  mongoose.models.CareerApplication || mongoose.model('CareerApplication', careerApplicationSchema);

export default CareerApplication;