import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async ({ to, subject, html }) => {
  // Try configured SMTP first (production/dev with proper SMTP credentials)
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    console.log("Attempting Gmail send with user:", user);
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        // Additional Gmail-specific settings for better deliverability
        secure: true, // use SSL
        port: 465, // Gmail SSL port
        tls: {
          rejectUnauthorized: false, // Sometimes needed for cloud deployments
        },
      });

      const info = await transporter.sendMail({
        from: `"CodeMentor AI" <${user}>`,
        to,
        subject,
        html,
        // Add headers for better deliverability
        headers: {
          "X-Mailer": "CodeMentor AI Mailer",
          "Return-Path": user,
          "Reply-To": user,
        },
      });

      console.log("sendEmail: successfully sent via Gmail");
      console.log("Message ID:", info.messageId);
      return info;
    } catch (err) {
      console.error("sendEmail: Gmail SMTP failed, error details:", {
        message: err.message,
        code: err.code,
        command: err.command,
        response: err.response,
      });

      // If Gmail fails, don't fall back to Ethereal in production
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Email sending failed: ${err.message}`);
      }
    }
  }

  // The code below will not run if Gmail fails
  // Fallback: create an Ethereal test account so devs can preview emails locally
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App Name (Ethereal)" <${testAccount.user}>`,
      to,
      subject,
      html,
    });

    // Log preview URL for developer convenience
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.info("sendEmail: sent via Ethereal preview URL:", previewUrl);
    return info;
  } catch (err) {
    console.error(
      "sendEmail: failed to send email (both SMTP and Ethereal)",
      err,
    );
    throw err;
  }
};
