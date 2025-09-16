import mongoose from "mongoose";

const talentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },

    talent: {
      type: String,
      required: true,
    },
    portfolioUrl: {
      type: String,
    },
    experience: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },

    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Talent = mongoose.model("Talent", talentSchema);
export default Talent;
