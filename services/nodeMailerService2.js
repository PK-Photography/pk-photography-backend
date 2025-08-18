import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "email-smtp.ap-south-1.amazonaws.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASS,
  },
});

export const sendBookingEmail = async (newBooking) => {
  await transporter.sendMail({
    from: process.env.nodemailer_from_email,
    to: process.env.nodemailer_to_email,
    subject: "New Booking Received",
    html: `
      <h2 style="color: #2e6c80;">📸 New Booking Confirmed</h2>
      <p>A new booking has been received with the following details:</p>
      <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr><td><strong>Name:</strong></td><td>${newBooking.name}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${newBooking.email}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${newBooking.phone}</td></tr>
        <tr><td><strong>Address:</strong></td><td>${
          newBooking.address
        }</td></tr>
        <tr><td><strong>Service:</strong></td><td>${
          newBooking.service
        }</td></tr>
        <tr><td><strong>Preferred Date:</strong></td><td>${new Date(
          newBooking.date
        ).toLocaleDateString("en-US")}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${
          newBooking.time || "Not specified"
        }</td></tr>
        <tr><td><strong>Additional Message:</strong></td><td>${
          newBooking.message
        }</td></tr>
      </table>
      <p style="margin-top: 20px;">Booking created on: <em>${new Date(
        newBooking.createdAt
      ).toLocaleString()}</em></p>
    `,
  });
};
