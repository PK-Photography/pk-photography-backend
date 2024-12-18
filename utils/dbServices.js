// create one as well as create many
const create = async (model, data) => {
  try {
    const result = await model.create(data);
    return result;
  } catch (error) {
    throw error;
  }
};

const insertMany = async (model, data, options = { ordered: true }) => {
  try {
    const result = await model.insertMany(data, options);
    return result;
  } catch (error) {
    throw error;
  }
};

// update single document that will return updated document
const updateOne = async (model, filter, data, options = { new: true }) => {
  try {
    const result = await model.findOneAndUpdate(filter, data, options);
    return result;
  } catch (error) {
    throw error;
  }
};

// delete single document that will return updated document
const deleteOne = async (model, filter, options = { new: true }) => {
  try {
    const result = await model.findOneAndDelete(filter, options);
    return result;
  } catch (error) {
    throw error;
  }
};

// update multiple documents and returns count
const updateMany = async (model, filter, data) => {
  try {
    const result = await model.updateMany(filter, data);
    return result;
  } catch (error) {
    throw error;
  }
};

// delete multiple documents and returns count
const deleteMany = async (model, filter) => {
  try {
    const result = await model.deleteMany(filter);
    return result;
  } catch (error) {
    throw error;
  }
};

// find single document by query
const findOne = async (model, filter, options) => {
  try {
    const result = await model.findOne(filter, options);
    return result;
  } catch (error) {
    throw error;
  }
};

// bulk create
const bulkCreate = async (model, filter, options) => {
  try {
    const result = await model.bulkCreate(filter, options);
    return result;
  } catch (error) {
    throw error;
  }
};

// find multiple documents
const findMany = async (model, filter, options = {}) => {
  try {
    const result = await model.find(filter, options);
    return result;
  } catch (error) {
    throw error;
  }
};

// count documents
const count = async (model, filter) => {
  try {
    const result = await model.countDocuments(filter);
    return result;
  } catch (error) {
    throw error;
  }
};

// find documents with pagination
const paginate = async (model, filter, options) => {
  try {
    const result = await model.paginate(filter, options);
    return result;
  } catch (error) {
    throw error;
  }
};

export default {
  create,
  insertMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  findOne,
  findMany,
  bulkCreate,
  count,
  paginate,
};
