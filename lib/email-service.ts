import nodemailer from "nodemailer"

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "happllesoftwaresolutions@gmail.com", 
    pass: "ngispzicghokymtm", // Use app password for Gmail
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: '"CETMCA26 Quiz App" <happllesoftwaresolutions@gmail.com>',
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export function generateOTP() {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateVerificationEmailTemplate(otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">CETMCA26 Email Verification</h2>
      <p>Thank you for registering with CETMCA26 Quiz App. Please use the following OTP to verify your email address:</p>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this verification, please ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
        &copy; ${new Date().getFullYear()} CETMCA26. All rights reserved.
      </p>
    </div>
  `
}

export function generatePasswordResetEmailTemplate(otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">CETMCA26 Password Reset</h2>
      <p>You requested to reset your password for the CETMCA26 Quiz App. Please use the following OTP to reset your password:</p>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
        &copy; ${new Date().getFullYear()} CETMCA26. All rights reserved.
      </p>
    </div>
  `
}