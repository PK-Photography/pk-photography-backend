import mongoose from 'mongoose';

const cardSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      default: null,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: [
    {
      name: { type: String, required: true },       
      images: { type: String }                    
    }
  ]
  },
  {
    timestamps: true,
  }
);


const Card = mongoose.model('Card', cardSchema);

export default Card;