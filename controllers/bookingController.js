// // Replace `module.exports` with `export`
// import { sendEmail } from '../services/nodeMailerService.js';

// export const sendBookingEmail = async (req, res) => {
//     const { email, name } = req.body;

//     try {
//         await sendEmail(
//             email,
//             'Thank You for the booking with PK Photography.',
//             { name }
//         );

//         res.status(200).json({ message: 'Email sent successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to send email', error });
//     }
// };






import Booking from '../models/booking.js';
import { sendEmail } from '../services/nodeMailerService.js';

// Create Booking
// export const createBooking = async (req, res) => {
//     const {
//         name,
//         email,
//         phone,
//         address,
//         service,
//         message,
//         date,
//         time,
//     } = req.body;

//     try {
//         // Create a new booking
//         const newBooking = new Booking({
//             name,
//             email,
//             phone,
//             address,
//             service,
//             message,
//             date,
//             time,
//         });

//         await newBooking.save();

//         // Send email to user
//         await sendEmail(
//             email,
//             'Your Booking Confirmation - PK Photography',
//             { name, service, date, time } // Pass dynamic data for EJS template
//         );

//         res.status(201).json({
//             success: true,
//             message: 'Booking created and email sent successfully',
//             data: newBooking,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Failed to create booking',
//             error: error.message,
//         });
//     }
// };
export const createBooking = async (req, res) => {
    const {
        name,
        email,
        phone,
        address,
        service,
        message,
        date,
        time,
    } = req.body;

    try {
        console.log("Creating booking with data:", req.body);

        // Create a new booking
        const newBooking = new Booking({
            name,
            email,
            phone,
            address,
            service,
            message,
            date,
            time,
        });

        console.log("Saving booking...");
        await newBooking.save(); // Make sure your save operation is working

        // Send email to user
        console.log("Sending email to:", email);
        await sendEmail(
            email,
            'Your Booking Confirmation - PK Photography',
            { name, service, date, time } // Pass dynamic data for EJS template
        );

        res.status(201).json({
            success: true,
            message: 'Booking created and email sent successfully',
            data: newBooking,
        });
    } catch (error) {
        console.error("Error during booking creation:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message,
        });
    }
};

// Get All Bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message,
        });
    }
};

// Get a Single Booking
export const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message,
        });
    }
};

// Delete Booking
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: error.message,
        });
    }
};
