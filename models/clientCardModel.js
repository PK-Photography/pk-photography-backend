import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: Array,
      required: true,
    },
    clientId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const clientCard = mongoose.model("clientCard", cardSchema);

export default clientCard;
