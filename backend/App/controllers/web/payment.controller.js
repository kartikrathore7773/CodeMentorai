import crypto from "crypto";
// import razorpay from "../../config/razorpay.js";
import razorpay from "../../config/razorpay.js";
import PremiumService from "../../models/PremiumService.js";
import PremiumSubscription from "../../models/PremiumSubscription.js";
import User from "../../models/User.js";
import Cashfree from "../../config/cashfree.js";

/* =====================================================
   1️⃣ CREATE ORDER
===================================================== */
export const createOrder = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = req.user?._id;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID required" });
    }

    const service = await PremiumService.findById(serviceId);

    if (!service || !service.isActive) {
      return res.status(404).json({ message: "Service not available" });
    }

    // Check if razorpay.orders.create is a function
    if (typeof razorpay?.orders?.create !== "function") {
      console.error("Razorpay orders.create is not available");
      return res.status(500).json({
        message: "Payment service not configured. Contact support.",
      });
    }

    const options = {
      amount: service.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      service,
    });
  } catch (error) {
    console.error("Create Order Error:", error.message || error);
    return res.status(500).json({
      message: error.message || "Order creation failed",
    });
  }
};

/* =====================================================
   2️⃣ VERIFY PAYMENT
===================================================== */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      serviceId,
      name,
      telegramUsername,
      mobile,
      email,
      note,
    } = req.body;

    /* ================= USER ================= */

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    /* ================= VALIDATION ================= */

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment details",
      });
    }

    /* ================= SIGNATURE VERIFY ================= */

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid signature",
      });
    }

    /* ================= SERVICE ================= */

    const service = await PremiumService.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    /* ================= SUBSCRIPTION DATES ================= */

    const startDate = new Date();

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + service.durationInMonths);

    /* ================= CREATE SUBSCRIPTION ================= */

    const subscription = await PremiumSubscription.create({
      user: userId,
      premiumService: service._id,

      name,
      telegramUsername,
      mobile,
      email,
      note,

      finalAmount: service.price,
      status: "approved",

      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified & subscription activated",
      subscription,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      message: "Verification failed",
    });
  }
};

/* =====================================================
   3️⃣ WEBHOOK HANDLER (PRODUCTION SAFETY)
===================================================== */
export const webhookHandler = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      console.log("Payment captured via webhook");
      // Optional: extra validation logic
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ message: "Webhook failed" });
  }
};

/* =====================================================
   CASHFREE PAYMENT
===================================================== */

export const createCashfreeOrder = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = req.user?._id;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID required" });
    }

    const service = await PremiumService.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: "Service not available" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let request = {
      order_amount: service.price,
      order_currency: "INR",
      order_id: `order_${Date.now()}`,
      customer_details: {
        customer_id: userId.toString(),
        customer_phone: user.mobile || "9999999999", // Fallback phone
        customer_name: user.name,
        customer_email: user.email,
      },
      order_meta: {
        return_url: `http://localhost:3000/premium/success?order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    const paymentLink = `https://sandbox.cashfree.com/pg/orders/sessions/${response.data.payment_session_id}`;

    res.json({ payment_link: paymentLink });
  } catch (err) {
    console.error("Cashfree order creation error:", err);
    res.status(500).json({ message: "Failed to create Cashfree order" });
  }
};

export const getCashfreeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

    // Assuming we proceed with creating subscription from here if payment is successful
    if (
      response.data &&
      response.data.length > 0 &&
      response.data[0].payment_status === "SUCCESS"
    ) {
      const payment = response.data[0];
      const serviceId = payment.order_tags?.serviceId; // This assumes you'll add serviceId to order tags
      const userId = payment.customer_details.customer_id;

      if (!serviceId || !userId) {
        return res
          .status(400)
          .json({ message: "Missing service or user ID in order details." });
      }

      const service = await PremiumService.findById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + service.durationInMonths);

      const subscription = await PremiumSubscription.create({
        user: userId,
        premiumService: service._id,
        name: payment.customer_details.customer_name,
        email: payment.customer_details.customer_email,
        mobile: payment.customer_details.customer_phone,
        finalAmount: payment.order_amount,
        status: "approved",
        startDate,
        endDate,
      });

      return res.json({
        success: true,
        message: "Payment verified & subscription activated",
        subscription,
        paymentDetails: response.data,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Payment not successful or order not found." });
    }
  } catch (err) {
    console.error("Cashfree status check error:", err);
    res.status(500).json({ message: "Failed to get Cashfree order status" });
  }
};
