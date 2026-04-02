import { sendEmail } from "./utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

async function testEmailProduction() {
  try {
    console.log("Testing email sending in production mode...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***" + process.env.EMAIL_PASS.slice(-4) : "NOT SET");
    console.log("CLIENT_URL:", process.env.CLIENT_URL);

    const result = await sendEmail({
      to: "kartikrathore770@gmail.com", // Test with your own email
      subject: "Production Email Test - CodeMentor AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🚀 Production Email Test</h2>
          <p>This is a test email from your CodeMentor AI production server.</p>
          <p><strong>CLIENT_URL:</strong> ${process.env.CLIENT_URL}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you receive this email, the email system is working correctly!</p>
        </div>
      `,
    });
    console.log("✅ Email sent successfully:", result);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    console.error("Full error:", error.message);
  }
}

testEmailProduction();