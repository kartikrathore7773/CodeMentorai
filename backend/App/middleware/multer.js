import multer from "multer";
import path from "path";
import fs from "fs";

// Function to ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "backend/uploads/";
    if (file.fieldname === "bannerImage") {
      uploadPath = path.join(uploadPath, "banners");
    } else if (file.fieldname === "pdf") {
      uploadPath = path.join(uploadPath, "pdfs");
    }
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "bannerImage") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  } else if (file.fieldname === "pdf") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Not a PDF! Please upload a PDF file."), false);
    }
  } else {
    cb(new Error("Invalid file field."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB limit
});

export default upload;
