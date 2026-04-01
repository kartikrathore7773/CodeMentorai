import express from "express";
import upload from "../../App/middleware/multer.js";
import { createCourse } from "../../App/controllers/admin/course.admin.controller.js";

const router = express.Router();

router.post(
  "/courses",
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  createCourse,
);

export default router;
