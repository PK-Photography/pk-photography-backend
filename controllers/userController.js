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
  


/**
 * @description : get logged In user profile of single User from mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @fields : UserId.
 * @return {Object} : find User details. {status, message, data}
 */

const getUserProfile = async (req, res) => {
  try {
    // Finding the User record by ID
    const findData = await dbService.findOne(User, { _id: req.user.id });

    if (!findData) {
      return res.recordNotFound({ data: findData });
    }

    let data = {
      Users: findData,
    };

    return res.success({ data: data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
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
    const { error, value } = loginValidation.validate(req.body);
    if (error) {
      return res.badRequest({ message: error.details[0].message });
    }

    const { email, password } = value;

    if (!email) {
      return res.badRequest({ message: "Please enter email." });
    }
   
    const lowerCaseEmail = email.toLowerCase();

    // Checking if the User is already registered using the email or mobile number
    const findData = await dbService.findOne(User, {
      email: lowerCaseEmail,
    });

    if (!findData) {
      return res.badRequest({ message: "User doesn't exist" });
    }

    if (findData.isverify === false) {
      return res.badRequest({
        message: "Please verify email to login your account.",
      });
    }
    if (findData.isBan === true) {
      return res.badRequest({
        message:
          "You cann't access your account. Your account has been suspended.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, findData.password);
    
    // If password matches, generate access and refresh tokens
    if (passwordMatch) {
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
      return res.success({ data: data });
    } else {
      return res.badRequest({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res.internalServerError({ message: error.message });
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

    const findData = await dbService.findOne(User, { email: lowerCaseEmail });

    if (!findData) {
      return res.recordNotFound({
        message: "User dosen't exist! Enter right email.",
      });
    }
    const subject = "Email for reset your password";
    const otp = common.randomNumber();
    const data = await User.updateOne({ email: findData.email }, { $set: { otp: otp } });
    await sendEmail(findData.fullName, subject, findData.email, otp);
    return res.success({
      data: data,
      message: "Please check your email any enter OTP to Reset your password.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
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
      return res.badRequest({ message: "OTP is too long!" });
    }

    // Perform Joi validation
    const { error } = userValidation.validate({
      email,
      password,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const lowerCaseEmail = email.toLowerCase();

    const userData = await dbService.findOne(User, { email: lowerCaseEmail });

    if (!userData) {
      return res.recordNotFound({ message: "Something went wrong!" });
    }
    if (!userData.otp == otp) {
      return res.recordNotFound({ message: "Please enter valid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    await User.findByIdAndUpdate(
      { _id: userData.id },
      { $set: { password: hashedPassword, otp: "" } },
      { new: true }
    );
    return res.success({
      message:
        "Password has been changed. You can login with your new password",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


const updateProfileImage = async (req, res) => {
  try {
    const userData = await dbService.findOne(User, { _id: req.user.id });
    if (!userData) {
      return res.badRequest({ message: "User doesn't exist." });
    }

    const { fields, files } = await parseForm(req);

    const normalizedFields = {};
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        normalizedFields[key] = fields[key][0];
      }
    }

    if (!files || !files["profileImage"]) {
      return res.badRequest({ message: "Profile Image is missing" });
    }

    const uploadedImage = await upload(
      files["profileImage"],
      ImageRule.user_profile,
      userData.profileImage ? userData.profileImage : null
    );

    const updatedData = await User.findByIdAndUpdate(
      { _id: userData.id },
      { $set: { profileImage: uploadedImage } },
      { new: true }
    );

    if (!updatedData) {
      return res.recordNotFound({ data: updatedData });
    }

    return res.success({ data: updatedData });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

export { UserSignUp, UserVerifyEmailOTP };
