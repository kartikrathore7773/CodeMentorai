const Payment = require("../models/Payment");
const User = require("../models/User");

exports.getAllPayments = async (req, res) => {
  const payments = await Payment.find()
    .populate("user", "name email")
    .populate("plan", "title price")
    .sort({ createdAt: -1 });

  res.json(payments);
};

// User Management Functions
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select(
        "-password -resetPasswordToken -resetPasswordExpire -emailVerifyToken",
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Soft delete - mark as deleted instead of removing
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "User has been deactivated",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Restore user
    user.isDeleted = false;
    user.deletedAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: "User has been restored",
    });
  } catch (error) {
    console.error("RESTORE USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore user",
    });
  }
};
