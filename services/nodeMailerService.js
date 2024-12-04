import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anshuman55.at@gmail.com', // Replace with your email
        pass: 'ahfc vasv ceqp tqne',    // Replace with your app password or email password
    },
});

// Function to send email
export const sendEmail = async (to, subject, data) => {
    try {
        // Update template path to match your folder structure
        const templatePath = path.join(__dirname, 'templates', 'welcomeEmail.ejs');
        console.log('Resolved Template Path:', templatePath); // Debugging line

        // Render the EJS template to HTML
        const htmlContent = await ejs.renderFile(templatePath, data);

        // Send the email
        const info = await transporter.sendMail({
            from: 'anshuman55.at@gmail.com',
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
