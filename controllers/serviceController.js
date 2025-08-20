import Service from "../models/serviceModel.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

export const createService = async (req, res) => {
  try {
    const { name, description, duration } = req.body;
    console.log(typeof description);
    const file = req.file;
    if (!name) {
      return res.status(400).json({ message: "Service name is required" });
    }

    let s3Result = null;
    if (file) {
      s3Result = await uploadToS3(file, "service");
    }

    const objToUpload = {};
    if (name !== undefined) objToUpload.name = name.trim();
    if (description !== undefined) objToUpload.description = description.trim();
    if (duration !== undefined) objToUpload.duration = duration.trim();
    if (s3Result) objToUpload.imageUrl = s3Result.Location;

    const createdService = new Service(objToUpload);

    await createdService.save();
    res.status(201).json({ message: "Service created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create service" });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { name, description, duration } = req.body;
    const file = req.file;
    let s3Result = null;
    if (file) {
      s3Result = await uploadToS3(file, "service");
    }

    const updatedObj = {};
    if (name !== undefined) updatedObj.name = name.trim();
    if (description !== undefined) updatedObj.description = description.trim();
    if (duration !== undefined) updatedObj.duration = duration.trim();
    if (s3Result) updatedObj.imageUrl = s3Result.Location;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updatedObj,
      { new: true }
    );
    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(updatedService);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to update service" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "service not found" });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to delete the service" });
  }
};
