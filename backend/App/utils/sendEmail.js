import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  // Try SendGrid first
  if (process.env.SENDGRID_API_KEY) {
    try {
      const msg = {
        to, // Recipient email
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@codementor.ai", // Verified sender email in SendGrid
        subject,
        html,
      };

      const result = await sgMail.send(msg);
      console.log("sendEmail: successfully sent via SendGrid");
      console.log("Message ID:", result[0]?.headers?.["x-message-id"]);
      return result;
    } catch (error) {
      console.error(
        "sendEmail: SendGrid failed, falling back to Gmail SMTP. Error:",
        {
          message: error.message,
          code: error.code,
          response: error.response?.body,
        },
      );
    }
  }

  // Fallback 1: Try Gmail SMTP
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
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

      console.log("sendEmail: successfully sent via Gmail SMTP (fallback)");
      console.log("Message ID:", info.messageId);
      return info;
    } catch (err) {
      console.error(
        "sendEmail: Gmail SMTP failed, falling back to Ethereal. Error:",
        {
          message: err.message,
          code: err.code,
          command: err.command,
          response: err.response,
        },
      );
    }
  }

  // Fallback 2: Ethereal test account (development only)
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
      from: `"CodeMentor AI (Ethereal)" <${testAccount.user}>`,
      to,
      subject,
      html,
    });

    // Log preview URL for developer convenience
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.info(
      "sendEmail: sent via Ethereal preview URL (final fallback):",
      previewUrl,
    );
    return info;
  } catch (err) {
    console.error(
      "sendEmail: All email methods failed (SendGrid, Gmail SMTP, Ethereal)",
      err,
    );
    throw new Error(`Email sending failed: ${err.message}`);
  }
};
