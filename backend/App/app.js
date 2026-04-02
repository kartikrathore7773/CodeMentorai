import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import premiumRoutes from "./routes/premium.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import adminBlogRoutes from "./routes/admin.blog.routes.js";
import authRoutes from "./routes/authRoutes.js";
import adminCourseRoutes from "./routes/admin/course.admin.routes.js";
import courseRoutes from "./routes/web/course.routes.js";
import serviceRoutes from "./routes/web/service.routes.js";
import workRoutes from "./routes/work.routes.js";
import adminServiceRoutes from "./routes/admin/service.admin.routes.js";
import aiRoutes from "./routes/web/ai.routes.js";
import contactRoutes from "./routes/contactRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import programAdminRoutes from "./routes/admin/program.admin.route.js";
import programWebRoutes from "./routes/web/program.route.js";
// import paymentRoutes from "./routes/payment.routes.js";
import { webhookHandler } from "./controllers/web/payment.controller.js";
import paymentRoutes from "./routes/payment.routes.js";
import autogbpRoutes from "./routes/web/autogbp.routes.js";
import googleRoutes from "./routes/google.route.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import hackathonAdminRoute from "./routes/admin/hackthon.admin.routes.js";
import adminCommentRoutes from "./routes/admin/comment.admin.routes.js";
import adminRoutes from "../routes/adminRoutes.js";
import analyticsRoutes from "../routes/analyticsRoutes.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: [
      "http://localhost:3003",
      "http://10.100.125.51:3003",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);

app.use(cookieParser());

// ❌ GLOBAL body parsers hata do
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// ✅ JSON only for non-file APIs
app.use("/api/auth", express.json(), authRoutes);
app.use("/api/blogs", express.json(), blogRoutes);
app.use("/api", express.json(), commentRoutes);
app.use(
  "/api/admin/blogs",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  adminBlogRoutes,
);

app.use("/api/admin", express.json(), adminCommentRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ FILE UPLOAD ROUTE (NO json/urlencoded)
app.use("/api/contact", express.json(), contactRoutes);
app.use("/api/testimonial", express.json(), testimonialRoutes);
app.use("/api/admin", adminCourseRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin/services", express.json(), adminServiceRoutes);
// app.use("/api/premium", premiumRoutes);
app.use("/api/premium", express.json(), premiumRoutes);
// ✅ web APIs
import coursePreviewRoutes from "../routes/courseRoutes.js";
// ... existing code ...
app.use("/api", courseRoutes);
app.use("/courses", coursePreviewRoutes);
// ... existing code ...

app.use("/api/work", express.json(), workRoutes);
// 🔥 AI Semantic Search Route

app.use("/api", express.json(), aiRoutes);

// program
app.use("/api/admin/program", express.json(), programAdminRoutes);
app.use("/api/program", express.json(), programWebRoutes);

// Razorpay webhook (raw body required)
app.use("/api/payment", express.json(), paymentRoutes);

app.post(
  "/api/payment/webhook",
  bodyParser.raw({ type: "application/json" }),
  webhookHandler,
);

app.use("/api/payment", express.json(), paymentRoutes);

// Google businees auto

app.use("/api/autogbp", express.json(), autogbpRoutes);
app.use("/api/google", googleRoutes);

// hackathonRoutes
app.use("/api/hackathons", express.json(), hackathonRoutes);
app.use("/api/participation", express.json(), hackathonRoutes); // Reusing the same router which has /join

//admin
app.use("/api/admin", express.json(), adminRoutes);
app.use("/api/analytics", express.json(), analyticsRoutes);

app.post(
  "/api/payment/webhook",
  bodyParser.raw({ type: "application/json" }),
  webhookHandler,
);

app.use("/api/payment", express.json(), paymentRoutes);

// Basic root route so browser GET / doesn't return "Cannot GET /"
app.get("/", (req, res) => {
  res.send("API running");
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
