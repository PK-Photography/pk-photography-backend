import SubService from "../models/subService.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

// CREATE
export const createSubService = async (req, res) => {
  try {
    const {
      serviceId,
      name,
      price,
      time,
      description,
      advanceAmount,
      whatYouGet,
      upgradeOption,
      perfectFor,
    } = req.body;

    const file = req.file;

    if (
      !serviceId ||
      !name ||
      !price ||
      !time ||
      !description ||
      !whatYouGet ||
      !upgradeOption ||
      !perfectFor ||
      !file ||
      isNaN(parseFloat(price))
    ) {
      return res
        .status(400)
        .json({ message: "Required attributes not present or invalid" });
    }

    const s3Result = await uploadToS3(file, "subService");

    const objToUpload = {
      serviceId,
      name: name.trim(),
      price: parseFloat(price),
      time: time.trim(),
      description: description.trim(),
      whatYouGet: whatYouGet.trim(),
      perfectFor: perfectFor.trim(),
      imageUrl: s3Result.Location,
      upgradeOption: upgradeOption.trim(),
    };

    if (advanceAmount !== undefined && !isNaN(parseFloat(advanceAmount))) {
      objToUpload.advanceAmount = parseFloat(advanceAmount);
    }

    const createdSubService = new SubService(objToUpload);
    await createdSubService.save();

    res.status(201).json({ message: "SubService created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create sub-service" });
  }
};

// READ
export const getSubServices = async (req, res) => {
  try {
    const subServices = await SubService.find();
    res.status(200).json(subServices);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch sub-services" });
  }
};

// UPDATE
export const updateSubService = async (req, res) => {
  try {
    const {
      serviceId,
      name,
      price,
      time,
      description,
      advanceAmount,
      whatYouGet,
      upgradeOption,
      perfectFor,
    } = req.body;

    const file = req.file;
    let s3Result = null;

    if (file) {
      s3Result = await uploadToS3(file, "subService");
    }

    const updatedObj = {};

    if (serviceId !== undefined) updatedObj.serviceId = serviceId;
    if (name !== undefined) updatedObj.name = name.trim();
    if (price !== undefined && !isNaN(parseFloat(price)))
      updatedObj.price = parseFloat(price);
    if (time !== undefined) updatedObj.time = time.trim();
    if (description !== undefined) updatedObj.description = description.trim();
    if (whatYouGet !== undefined) updatedObj.whatYouGet = whatYouGet.trim();
    if (perfectFor !== undefined) updatedObj.perfectFor = perfectFor.trim();
    if (upgradeOption !== undefined)
      updatedObj.upgradeOption = upgradeOption.trim();
    if (s3Result) updatedObj.imageUrl = s3Result.Location;
    if (advanceAmount !== undefined && !isNaN(parseFloat(advanceAmount))) {
      updatedObj.advanceAmount = parseFloat(advanceAmount);
    }

    const updatedSubService = await SubService.findByIdAndUpdate(
      req.params.id,
      updatedObj,
      { new: true }
    );

    if (!updatedSubService) {
      return res.status(404).json({ message: "SubService not found" });
    }

    res.status(200).json(updatedSubService);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to update sub-service" });
  }
};

// DELETE
export const deleteSubService = async (req, res) => {
  try {
    const deleted = await SubService.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "SubService not found" });
    }
    res.status(200).json({ message: "SubService deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to delete the sub-service" });
  }
};
