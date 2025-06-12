import { JWT } from "../constants/authConstant.js";
import User from "../models/user.js";
import { generateToken } from "../services/authServices.js";
import { sendEmail } from "../services/nodeMailerService.js";
import bcrypt from 'bcryptjs';
import passport from "passport";
import jwt from "jsonwebtoken";

export const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });
const googleAuthController = async (req, res) => {
  try {
    const { name, email, image } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        image,
      });
      await user.save();
    }

    res.status(200).json({ message: "User authenticated successfully", user });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get authenticated user profile
const getProfile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid Token" });
  }
};



const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!["Viewer", "Writer", "Client", "Subscriber"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error });
  }
};




const UserSignUp = async (req, res) => {
  try {
    const { fullName, mobileNo, email, password } = req.body;

    // Custom validations
    if (!fullName || !mobileNo || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (!/^[a-zA-Z ]{2,50}$/.test(fullName)) {
      return res.status(400).json({ success: false, message: "Invalid full name format." });
    }
    if (!/^\+?[0-9]{10,15}$/.test(mobileNo)) {
      return res.status(400).json({ success: false, message: "Invalid mobile number format." });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const lowerCaseEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already registered." });
    }

    // Create new user (store plain password directly)
    const newUser = {
      fullName,
      mobileNo,
      email: lowerCaseEmail,
      password, // Store plain password
    };

    const createdUser = await User.create(newUser);
    if (!createdUser) {
      return res.status(500).json({ success: false, message: "User creation failed." });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Random 6-digit OTP
    await User.updateOne({ email: createdUser.email }, { $set: { otp } });

    // const subject = "Account Verification OTP";
    // const emailData = { name: createdUser.fullName, otp };
    // await sendEmail(createdUser.email, subject, "otpTemplate", emailData);

    return res.status(201).json({
      success: true,
      message: "Check your email for the OTP to verify your account.",
      otp: otp
    });
  } catch (error) {
    console.error("Error in UserSignUp:", error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


const UserVerifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Custom validations
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number.",
      });
    }

    const lowerCaseEmail = email.toLowerCase();

    // Find the user by email
    const userData = await User.findOne({ email: lowerCaseEmail });

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please provide a valid email.",
      });
    }

    if (userData.isverify) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified. You can log in.",
      });
    }

    if (userData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Update the user's verification status
    userData.isverify = true;
    userData.otp = ""; // Clear OTP after successful verification
    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Your account has been successfully verified.",
    });
  } catch (error) {
    console.error("Error in UserVerifyEmailOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



/**
 * @description : get logged In user profile of single User from mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @fields : UserId.
 * @return {Object} : find User details. {status, message, data}
 */

const getUserProfile = async (req, res) => {
  try {
    // Extract userId from the authenticated request (e.g., from middleware)
    const userId = req.user.id;

    // Find the user by their ID
    const user = await User.findById(userId).select("-password -otp"); // Exclude sensitive fields

    // If user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Return the user profile
    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



/**
 * @description : User login process including validation, checking user existence, verification status, and password comparison.
 * @param {Object} req : The request object including validated body parameters for email and password.
 * @param {Object} res : The response object to send back the login status, access token, and refresh token upon successful login.
 * @return {Object} : created User . {status, message, data}
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Validate email format
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    const lowerCaseEmail = email.toLowerCase();

    // Check if the user exists
    const findData = await User.findOne({ email: lowerCaseEmail });
    console.log("User found:", findData); // Log the user data for debugging

    if (!findData) {
      return res.status(400).json({ success: false, message: "User doesn't exist." });
    }

    // Check if the user has verified their email
    if (findData.isverify === false) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email to login.",
      });
    }

    // Check if the user is banned
    if (findData.isBan === true) {
      return res.status(400).json({
        success: false,
        message: "Your account has been suspended.",
      });
    }

    // Check if passwords match (plain text)
    if (findData.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    // Generate access and refresh tokens
    const accessToken = await generateToken(
      { id: findData._id },
      JWT.USER_SECRET,
      "7d"
    );
    const refreshToken = await generateToken(
      { id: findData._id },
      JWT.USER_REFRESH_SECRET,
      "30d"
    );

    const data = {
      user: findData,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: data,
    });
  } catch (error) {
    console.error("Error in login:", error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


const updateUserProfile = async (req, res) => {
  try {

    const { fullName, mobileNo, dob, education, occupation } = req.body;

    const dataToUpdate = {
      fullName: fullName,
      mobileNo: mobileNo,
      dob: dob,
      education: education,
      occupation: occupation,
    };

    const { error } = userValidation.validate(dataToUpdate);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const findData = await dbService.findOne(User, { _id: req.user.id });
    if (!findData) {
      return res.status(404).json({ message: "Record not found!" });
    }

    const profile = await dbService.updateOne(
      User,
      { _id: req.user.id },
      dataToUpdate
    );
    if (!profile) {
      return res.status(404).json({ message: "Record not found!" });
    }
    return res.status(200).json({ message: "Data has been updated." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



/**
 * @description : Initiates the process to reset user password by sending an OTP to the registered email.
 * @param {Object} req : The request object containing the user's email.
 * @param {Object} res : The response object to send success message or error upon failure.
 * @return {void}
 */
const UserForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    // Find the user by email
    const findData = await User.findOne({ email: lowerCaseEmail });

    if (!findData) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist! Enter the correct email.",
      });
    }

    // Generate OTP (Random 6-digit OTP)
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Update OTP for the user
    await User.updateOne({ email: findData.email }, { $set: { otp: otp } });

    // Send OTP email
    const subject = "Reset Your Password - OTP Verification";
    const emailData = { name: findData.fullName, otp };

    await sendEmail(findData.email, subject, "otpTemplate", emailData);

    return res.status(200).json({
      success: true,
      message: "Please check your email and enter the OTP to reset your password.",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

/**
 * @description : Resets the user password if OTP matches and updates the password in the database.
 * @param {Object} req : The request object containing email, OTP, and new password.
 * @param {Object} res : The response object to send success message or error upon failure.
 * @return {void}
 */
const UserResetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (otp.length > 6) {
      return res.status(400).json({ message: "OTP is too long!" });
    }

    const lowerCaseEmail = email.toLowerCase();

    const userData = await User.findOne({ email: lowerCaseEmail }); // Corrected this line

    if (!userData) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if OTP matches
    if (userData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Reset the password without hashing it (direct update)
    await User.findByIdAndUpdate(
      { _id: userData.id },
      { $set: { password, otp: "" } },
      { new: true }
    );

    // You can also generate a JWT token for the user here if needed
    const accessToken = await generateToken(
      { id: userData._id },
      JWT.USER_SECRET,
      "7d"
    );

    return res.status(200).json({
      success: true,
      message: "Password has been reset. You can now login with the new password.",
      accessToken, // Return the JWT token if you want
    });
  } catch (error) {
    console.error("Error in resetting password:", error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


export { updateUserRole, getAllUsers, UserSignUp, UserVerifyEmailOTP, login, UserResetPassword, UserForgotPassword, getUserProfile, googleAuthController, getProfile };
