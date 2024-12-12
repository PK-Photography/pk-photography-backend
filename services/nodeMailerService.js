// import nodemailer from 'nodemailer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import ejs from 'ejs';


// // Manually define __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Create a transporter
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     secure: true,
//     auth: {
//       user: process.env.NODEMAILER_AUTH_USER_EMAIL,
//       pass: process.env.NODEMAILER_AUTH_USER_PASSWORD,
//     }
//   });


// // Function to send email
// export const sendEmail = async (to, subject, data) => {
//     try {
//         // Update template path to match your folder structure
//         const templatePath = path.join(__dirname, 'templates', 'welcomeEmail.ejs');
//         console.log('Resolved Template Path:', templatePath); // Debugging line

//         // Render the EJS template to HTML
//         const htmlContent = await ejs.renderFile(templatePath, data);

//         // Send the email
//         const info = await transporter.sendMail({
//             from: process.env.NODEMAILER_AUTH_USER_EMAIL,
//             to,
//             subject,
//             html: htmlContent,
//         });

//         console.log('Email sent successfully:', info.messageId);
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };



import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
        user: process.env.NODEMAILER_AUTH_USER_EMAIL,
        pass: process.env.NODEMAILER_AUTH_USER_PASSWORD,
    }
});

// Function to send email with a dynamic EJS template
export const sendEmail = async (to, subject, templateName, data) => {
    try {
        // Dynamically resolve the template path
        const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);
        // console.log('Resolved Template Path:', templatePath); // Debugging line

        // Render the EJS template to HTML
        const htmlContent = await ejs.renderFile(templatePath, data);

        // Send the email
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_AUTH_USER_EMAIL,
            to,
            subject,
            html: htmlContent,
        });

        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
