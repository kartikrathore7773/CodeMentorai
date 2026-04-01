import Razorpay from "razorpay";

let razorpay;

try {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_KEY_ID === "your_key" ||
    process.env.RAZORPAY_KEY_SECRET === "your_secret"
  ) {
    console.warn(
      "⚠️ Razorpay keys not configured properly. Payment features will not work.",
    );
    razorpay = null;
  } else {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✓ Razorpay initialized successfully");
  }
} catch (error) {
  console.error("❌ Razorpay initialization error:", error.message);
  razorpay = null;
}

export default razorpay;
