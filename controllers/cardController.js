import Card from '../models/cardModel.js';
import cloudinary from 'cloudinary';
import clientCard from "../models/clientCardModel.js";
// import Card from "../models/clientCardModel.js";


const createCard = async (req, res) => {
  const { name, date, imageUrl } = req.body;

  try {
    const newCard = new Card({
      name,
      date,
      imageUrl, 
    });

    await newCard.save();

    res.status(201).json({ message: 'Card created successfully', newCard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating card', error });
  }
};


const uploadCard = async (req, res) => {
  const { name, date, image, category } = req.body;
  console.log(name, date, image, category);

  try {
    const uploadResponse = await cloudinary.v2.uploader.upload(image, {
      folder: 'wedding_cards',
    });

    const newCard = new Card({
      name,
      date,
      imageUrl: uploadResponse.secure_url,
      category
    });

    await newCard.save();

    res.status(201).json({ message: 'Card uploaded successfully', newCard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading image to Cloudinary', error });
  }
};


const getCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching cards', error });
  }
};

const getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id); // Find card by ID

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch card' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id, category } = req.body;
    const updatedCard = await Card.findByIdAndUpdate(id,{ $push: { category: category }},{ new: true });
    res.json(updatedCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update category' });
  }
}


const uploadCardByCategory = async (req, res) => {
  const { name, date, image,category } = req.body;

  try {
    const uploadResponse = await cloudinary.v2.uploader.upload(image, {
      folder: 'wedding_cards',
    });

    const newCard = new Card({
      name,
      date,
      image: uploadResponse.secure_url,
      category
    });

    await newCard.save();

    res.status(201).json({ message: 'Card uploaded successfully', newCard });
  } catch (error) {
    res.status(500).json({message: 'error uploading card'});
  }
}



const deleteCategoryCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.status(200).json({ message: 'Card deleted successfully', card });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Error deleting card', error });
  }
};


const uploadCardWithDriveLink = async (req, res) => {
  const { name, clientId, driveLink, category } = req.body;

  try {
    console.log("here");
    const news = await clientCard.create({ name, clientId,imageUrl: driveLink, category });
 
    res.status(201).json(news);

  } catch (error) {
    res.status(500).json({ message: "Error creating news entry", error });
  }
};

const UpdateCardWithDriveLink = async (req, res) => {
  const { clientId, driveLink, category } = req.body;

  if (!clientId || !driveLink || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the card using clientId and driveLink
    const updatedCard = await Card.findOneAndUpdate(
      { clientId, driveLink },  // Search criteria (match by clientId and driveLink)
      { category },  // Update the category field
      { new: true } // Return the updated card
    );

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      updatedCard,
    });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCardsByClientId = async (req, res) => {
  try {
    console.log("Fetching all cards");
    const cards = await Card.find(); // No fields specified, returns all card data
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({
      message: "Error fetching all cards",
      error,
    });
  }
};


const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Optional: Remove image from Cloudinary
    if (card.imageUrl) {
      const publicId = card.imageUrl.split('/').pop().split('.')[0]; // Extract publicId
      await cloudinary.v2.uploader.destroy(publicId); // Delete the image
    }

    await card.deleteOne(); // Delete the card from MongoDB
    res.status(200).json({ message: 'Card deleted successfully', card });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Error deleting card', error });
  }
};


// Delete a specific category from a card
const deleteCategory = async (req, res) => {
  const { id, categoryName } = req.body;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid client ID." });
    }

    if (!categoryName) {
      return res.status(400).json({ error: "Category name is required." });
    }

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ error: "Client not found." });
    }

    // Filter out the category to be deleted
    const updatedCategories = card.categories.filter(
      (category) => category.name !== categoryName
    );

    // Update the card document with the remaining categories
    card.categories = updatedCategories;
    await card.save();

    res.status(200).json({ message: "Category deleted successfully.", card });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "An error occurred while deleting the category." });
  }
};

// This is for download zip file
const downloadFile = async (req, res) => {
  const { fileId } = req.params;
  console.log('Received fileId:', fileId); // Log the fileId parameter
  const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  console.log('Constructed Google Drive URL:', fileUrl); // Log the constructed Google Drive URL
  
  try {
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileId}.jpg"`);
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching file:', error.message); // Log the error message
    res.status(404).json({ message: 'File not found or inaccessible', error: error.message });
  }
};









export { uploadCard, deleteCard, deleteCategory, getCards, createCard, getCardById, updateCategory, uploadCardByCategory, deleteCategoryCard, uploadCardWithDriveLink, getCardsByClientId, UpdateCardWithDriveLink, downloadFile };
