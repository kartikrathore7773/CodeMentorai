import Comment from "../../models/Comment.js";

/**
 * ===============================
 * ADMIN: GET ALL COMMENTS
 * ===============================
 */
export const getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find()
      .populate("userId", "name email")
      .populate("blogId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments();

    res.json({
      comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET ALL COMMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

/**
 * ===============================
 * ADMIN: DELETE COMMENT
 * ===============================
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
