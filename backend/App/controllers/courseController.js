import Course from "../models/Course.js";
import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";

export const getCoursePreview = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.pdf || !course.pdf.filePath) {
      return res.status(404).send("PDF not found");
    }

    const fullPath = path.join(process.cwd(), course.pdf.filePath);

    const existingPdfBytes = await fs.readFile(fullPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const previewPdf = await PDFDocument.create();

    const token = req.query.token;
    let isLoggedIn = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isLoggedIn = !!decoded;
      } catch (error) {
        // Invalid token
      }
    }

    const numPreviewPages = isLoggedIn
      ? pdfDoc.getPageCount()
      : Math.min(course.previewPages || 3, pdfDoc.getPageCount());

    const copiedPages = await previewPdf.copyPages(
      pdfDoc,
      Array.from({ length: numPreviewPages }, (_, i) => i),
    );
    copiedPages.forEach((page) => previewPdf.addPage(page));

    const previewPdfBytes = await previewPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=preview.pdf");
    res.send(Buffer.from(previewPdfBytes));
  } catch (error) {
    console.error("Error generating PDF preview:", error);
    res.status(500).send("Error generating PDF preview");
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({
      createdAt: -1,
    });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).send("Error fetching courses");
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send("Course not found");
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).send("Error fetching course");
  }
};
