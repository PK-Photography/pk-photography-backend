import Admin from "../models/admin.js";
import { adminSignToken } from "../services/authServices.js";
import bcrypt from "bcrypt";
import dbService from "../utils/dbServices.js";

/**
 * @description : Sign up a new admin user.
 * @param {Object} req : The request object including body for email and password.
 * @param {Object} res : The response object to send back the signup status, access token, and new admin details.
 * @fields : email, password
 * @return {Object} : Status message indicating the result of the signup operation, access token, and new admin details. {status, accessToken, newUser}
 */
export const signUp = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const lowerCaseEmail = email.toLowerCase();

    const user = await Admin.findOne({ email: lowerCaseEmail });
    if (user) {
      return res.status(400).json({ message: "User already exists, please login." });
    }

    const dataToCreate = {
      fullname,
      email: lowerCaseEmail,
      password,
    };

    const admin = await dbService.create(Admin, dataToCreate);

    if (!admin) {
      return res.status(400).json({
        message: "Something went wrong, Registration failed.",
      });
    }

    const accessToken = await adminSignToken(admin._id);

    return res.status(201).json({
      status: "success",
      accessToken,
      admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description : Log in an admin user.
 * @param {Object} req : The request object including body for email and password.
 * @param {Object} res : The response object to send back the login status and access token.
 * @fields : email, password
 * @return {Object} : Status message indicating the result of the login operation, access token, and admin details. {status, message, accessToken, admin}
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const lowerCaseEmail = email.toLowerCase();

    const admin = await Admin.findOne({ email: lowerCaseEmail }).select("+password");

    if (!admin) {
      return res.status(400).json({ message: "Admin doesn't exist" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const accessToken = await adminSignToken(admin._id);

    return res.status(200).json({
      status: "success",
      message: "Login successfully!",
      accessToken,
      admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
