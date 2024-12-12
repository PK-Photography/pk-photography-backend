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

        // Validate required fields
        if (!name || !email || !phone || !service || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

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
        await newBooking.save();

        // Send email to the client
        console.log("Sending confirmation email to client:", email);
        await sendEmail(
            email,
            'Your Booking Confirmation - PK Photography',
            'bookingInformation', // Client's email template
            { name, service, date, time } // Dynamic data for the client's email
        );

        // Send email to the admin
        console.log("Sending booking notification to admin...");
        await sendEmail(
            process.env.ADMIN_EMAIL, // Admin email
            'New Booking Notification - PK Photography',
            'newBookingNotification', // Admin's email template
            {
                name: newBooking.name,
                email: newBooking.email ,
                phone: newBooking.phone || "Not Provided",
                address: newBooking.address || "Not Provided",
                service: newBooking.service,
                message: newBooking.message || "Not Provided",
                date: newBooking.date,
                time: newBooking.time || "Not Provided",
            }
        );

        // Respond to the client
        res.status(201).json({
            success: true,
            message: 'Booking created and emails sent successfully',
            data: newBooking,
        });
    } catch (error) {
        console.error("Error during booking creation:", error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message,
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message,
        });
    }
};


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
//         console.log("Creating booking with data:", req.body);

//         // Validate required fields
//         if (!name || !email || !phone || !service || !date ) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields',
//             });
//         }

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

//         console.log("Saving booking...");
//         await newBooking.save();

//         // Send email with dynamic data
//         console.log("Sending email to:", email);
//         await sendEmail(
//             email,
//             'Your Booking Confirmation - PK Photography',
//             'bookingInformation', // === Template name
//             { name, service } // Dynamic data for the email
//         );

// // =============== || Send email to Admin ||===================

// await sendEmail(
//     'admin@pkphotography.io', // Replace with the recipient email
//     'New Booking Notification - PK Photography',
//     'newBookingNotification', // Template name
//     { 
//       name: Booking.name,
//       email: Booking.email,
//       phone: Booking.phone,
//       address: Booking.address,
//       service: Booking.service,
//       message: booking.message,
//       date: booking.date,
//       time: booking.time,
//     }
//   );

//         res.status(201).json({
//             success: true,
//             message: 'Booking created and email sent successfully',
//             data: newBooking,
//         });
//     } catch (error) {
//         console.error("Error during booking creation:", error);

//         // Handle Mongoose validation errors
//         if (error.name === 'ValidationError') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation error',
//                 error: error.message,
//             });
//         }

//         // Handle other errors
//         res.status(500).json({
//             success: false,
//             message: 'Failed to create booking',
//             error: error.message,
//         });
//     }
// };


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
