import { verifyAdminToken, verifyUserToken } from '../services/authServices.js'
import Admin from '../models/admin.js'
import mongoose from "mongoose"


import User from '../models/user.js'; // Replace with your actual user model

/**
 * @description : Check and authenticate the admin user based on the provided token.
 * @param {Object} req : The request object including headers for authorization token.
 * @param {Object} res : The response object to send back authentication status.
 * @param {Function} next : The next middleware function.
 * @return {void}
 */
export const checkAuthenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers?.authorization &&
      req.headers?.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({ message: "Token is not accessible!!" });
    }

    // Decode and verify token
    const decodedUserAuthData = await verifyAdminToken(token, res);

    // Fetch user data
    const userData = await Admin.findOne({
      _id: new mongoose.Types.ObjectId(decodedUserAuthData.id),
    });

    if (!userData) {
      return res.status(401).json({ message: "User is not authorized!" });
    }

    req.admin = userData;

    next();
  } catch (error) {
    next(error);
  }
};




/**
 * @description : Check and authenticate the Master admin based on the provided token.
 * @param {Object} req : The request object including headers for authorization token.
 * @param {Object} res : The response object to send back authentication status.
 * @param {Function} next : The next middleware function.
 * @return {void}
 */



export const checkRole = (...roles) => async (req, res, next) => {
  try {
    const { email } = req.admin;
    const user = await Admin.findOne({ email });

    if (!user || !roles.includes(user.role)) {
      return res.status(401).json({ message: "Sorry, you do not have access to this route" });
    }

    next();
  } catch (error) {
    next(error);
  }
}


/**
 * @description : Check and authenticate the regular user based on the provided token.
 * @param {Object} req : The request object including headers for authorization token.
 * @param {Object} res : The response object to send back authentication status.
 * @param {Function} next : The next middleware function.
 * @return {void}
 */
export const verifyUser = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers?.authorization &&
      req.headers?.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({ message: "Token is not accessible!!" });
    }

    // Decode and verify token for the regular user
    const decodedUserAuthData = await verifyUserToken(token, res);

    // Fetch user data
    const userData = await User.findOne({
      _id: new mongoose.Types.ObjectId(decodedUserAuthData.id),
    });

    if (!userData) {
      return res.status(401).json({ message: "User is not authorized!" });
    }

    req.user = userData; // Attach the user data to the request object

    next();
  } catch (error) {
    next(error);
  }
};
