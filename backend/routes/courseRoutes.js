import express from "express";
import {
  getCoursePreview,
  getAllCourses,
  getCourseById,
} from "../App/controllers/courseController.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.get("/:id/preview", getCoursePreview);

export default router;
