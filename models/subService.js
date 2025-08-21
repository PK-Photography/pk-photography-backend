import mongoose from "mongoose";

const subServiceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    advanceAmount: {
      type: Number,
    },
    whatYouGet: {
      type: String,
      required: true,
    },
    upgradeOption: {
      type: String,
      required: true,
    },
    perfectFor: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SubService = mongoose.model("SubService", subServiceSchema);
export default SubService;
