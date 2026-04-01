import express from "express";
const router = express.Router();
import User from "../App/models/User.js";
import PremiumSubscription from "../App/models/PremiumSubscription.js";
import BlogAnalytics from "../App/models/BlogAnalytics.js";
import Course from "../App/models/Course.js";
import Blog from "../App/models/Blog.js";

// Get analytics stats
router.get("/stats", async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({ isDeleted: false });

    // New sign-ups in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newSignUps = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: false,
    });

    // Active premium users (approved subscriptions)
    const activePremium = await PremiumSubscription.countDocuments({
      status: "approved",
    });

    // Total courses
    const totalCourses = await Course.countDocuments();

    // Total blogs
    const totalBlogs = await Blog.countDocuments();

    // Total page views (sum of all blog views)
    const pageViewsResult = await BlogAnalytics.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalPageViews =
      pageViewsResult.length > 0 ? pageViewsResult[0].totalViews : 0;

    // Total revenue from approved subscriptions
    const revenueResult = await PremiumSubscription.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalRevenue: { $sum: "$finalAmount" } } },
    ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      totalUsers,
      newSignUps,
      premiumUsers: activePremium,
      totalCourses,
      totalBlogs,
      pageViews: totalPageViews,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
