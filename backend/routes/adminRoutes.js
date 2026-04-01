import express from "express";
const router = express.Router();
import Blog from "../App/models/Blog.js";
import Course from "../App/models/Course.js";
import Service from "../App/models/Service.js";
import Premium from "../App/models/PremiumMembership.js";
import User from "../App/models/User.js";

// Get all stats
router.get("/stats", async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalServices = await Service.countDocuments();
    const premiumSubscriptions = await Premium.find({ status: "active" });
    const totalSubscriptions = premiumSubscriptions.length;
    const totalRevenue = premiumSubscriptions.reduce(
      (acc, sub) => acc + sub.finalAmount,
      0,
    );

    res.json({
      totalBlogs,
      totalUsers,
      totalCourses,
      totalServices,
      totalSubscriptions,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get popular blogs
router.get("/blogs/popular", async (req, res) => {
  try {
    // This is a placeholder. You'll need to implement your own logic for "popular" blogs.
    const blogs = await Blog.find().sort({ score: -1 }).limit(5);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
