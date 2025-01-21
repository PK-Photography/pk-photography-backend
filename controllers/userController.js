import User from "../models/user.js";
import { sendEmail } from "../services/nodeMailerService.js";

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

    // Create new user
    const newUser = {
      fullName,
      mobileNo,
      email: lowerCaseEmail,
      password,
    };

    const createdUser = await User.create(newUser);
    if (!createdUser) {
      return res.status(500).json({ success: false, message: "User creation failed." });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Random 6-digit OTP
    await User.updateOne({ email: createdUser.email }, { $set: { otp } });

    const subject = "Account Verification OTP";
    const emailData = { name: createdUser.fullName, otp };
    await sendEmail(createdUser.email, subject, "otpTemplate", emailData);

    return res.status(201).json({
      success: true,
      message: "Check your email for the OTP to verify your account.",
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
  

export { UserSignUp, UserVerifyEmailOTP };
