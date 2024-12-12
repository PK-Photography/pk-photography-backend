import twilio from "twilio";
import otpGenerator from 'otp-generator';
import { sendOtpToPhone } from '../utils/twilioService.js';
import Otp from '../models/signInModel.js';
import { OAuth2Client } from "google-auth-library";


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    const otp = otpGenerator.generate(6, { digits: true });

    try {
        await Otp.create({ phoneNumber, otp }); // Store OTP in MongoDB
        await sendOtpToPhone(phoneNumber, otp); // Send OTP via SMS

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error details in sendOtp:", error.message); // Log the error message
        console.error("Error stack:", error.stack); // Log the stack trace
        res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
    }
};




const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        const storedOtp = await Otp.findOne({ phoneNumber });
        if (!storedOtp) {
            return res.status(400).json({ success: false, message: "OTP not found" });
        }

        if (storedOtp.otp === otp) {
            // Optionally, delete OTP after successful verification
            await Otp.deleteOne({ phoneNumber });
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error in verifyOtp:", error.message);
        res.status(500).json({ success: false, message: "Verification failed", error: error.message });
    }
};


const googleAuth = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // Here, you can handle user authentication or registration logic
        res.status(200).json({ success: true, user: payload });
    } catch (error) {
        console.error("Google authentication error:", error.message);
        res.status(401).json({ success: false, message: "Invalid Google token" });
    }
};



  

export {sendOtp, verifyOtp, googleAuth};
