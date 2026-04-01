import express from "express";
import {
  getAllComments,
  deleteComment,
} from "../../controllers/admin/comment.admin.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/adminOnly.js";

const router = express.Router();

router.get("/comments", authMiddleware, adminOnly, getAllComments);
router.delete("/comments/:id", authMiddleware, adminOnly, deleteComment);

export default router;
