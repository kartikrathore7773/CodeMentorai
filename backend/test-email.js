import { sendEmail } from "./utils/sendEmail.js";

async function testEmail() {
  try {
    console.log("Testing email sending...");
    const result = await sendEmail({
      to: "kartikrathore770@gmail.com", // Replace with your real Gmail address
      subject: "Test Email",
      html: "<h1>Test</h1><p>This is a test email.</p>",
    });
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}

testEmail();
