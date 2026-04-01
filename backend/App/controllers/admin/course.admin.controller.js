import Course from "../../models/Course.js";
import slugify from "slugify";

/**
 * ===============================
 * ADMIN: UPDATE COURSE
 * ===============================
 * PUT /api/admin/courses/:id
 */
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const body = req.body || {};

    const makeWebPath = (p) => p.replace(process.cwd(), "").replace(/\\/g, "/");

    const {
      title,
      description,
      price,
      category,
      level,
      language,
      tags,
      duration,
      validityDays,
      previewPages,
      externalLinks,
      bannerUrl,

      accessType,
      showAdsForFreeUsers,
      allowDownloadAfterPurchase,
    } = body;

    // Update basic fields
    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = Number(price);
    if (category) course.category = category;
    if (level) course.level = level;
    if (language) course.language = language;
    if (tags) course.tags = tags.split(",");
    if (duration) course.duration = duration;
    if (validityDays) course.validityDays = validityDays;
    if (previewPages !== undefined) course.previewPages = Number(previewPages);
    if (externalLinks) course.externalLinks = JSON.parse(externalLinks);

    if (accessType) course.accessType = accessType;
    if (showAdsForFreeUsers !== undefined)
      course.showAdsForFreeUsers = showAdsForFreeUsers;
    if (allowDownloadAfterPurchase !== undefined)
      course.allowDownloadAfterPurchase = allowDownloadAfterPurchase;

    // Update PDF if provided
    if (req.files?.pdf) {
      course.pdf = {
        fileName: req.files.pdf[0].originalname,
        filePath: makeWebPath(req.files.pdf[0].path),
        fileSize: req.files.pdf[0].size,
      };
    }

    // Update banner
    if (bannerUrl) {
      course.bannerImage = { url: bannerUrl };
    } else if (req.files?.banner) {
      course.bannerImage = {
        fileName: req.files.banner[0].originalname,
        filePath: makeWebPath(req.files.banner[0].path),
        fileSize: req.files.banner[0].size,
      };
    }

    // Update attachments if provided
    if (req.files?.attachments) {
      course.attachments = req.files.attachments.map((f) => ({
        fileName: f.originalname,
        filePath: makeWebPath(f.path),
        fileSize: f.size,
        fileType: f.mimetype.includes("excel") ? "excel" : "other",
      }));
    }

    // Recalculate derived fields
    course.isPaid = course.accessType === "paid_only" || course.price > 0;
    if (course.accessType === "paid_only") {
      course.previewPages = 0;
    }

    await course.save();

    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    console.error("UPDATE ERROR 👉", err);
    res.status(500).json({
      message: "Course update failed",
    });
  }
};

/**
 * ===============================
 * ADMIN: CREATE COURSE
 * ===============================
 */
export const uploadCourse = async (req, res) => {
  try {
    const body = req.body || {};

    const {
      title,
      description,
      price = 0,
      category = "notes",
      level,
      language,
      tags,
      duration,
      validityDays,
      previewPages,
      externalLinks,
      bannerUrl,

      // 🔥 ACCESS CONTROLS
      accessType = "login_required", // public_preview | login_required | paid_only
      showAdsForFreeUsers = true,
      allowDownloadAfterPurchase = true,
    } = body;

    if (!title || !req.files?.pdf) {
      return res.status(400).json({
        message: "Title and PDF are required",
      });
    }

    /* ===============================
       VALIDATIONS
    =============================== */

    if (accessType === "paid_only" && Number(price) <= 0) {
      return res.status(400).json({
        message: "Paid-only course must have a price",
      });
    }

    /* ===============================
       DERIVED LOGIC
    =============================== */

    const isPaid = accessType === "paid_only" || Number(price) > 0;

    const finalPreviewPages =
      accessType === "paid_only" ? 0 : Number(previewPages || 3);

    const makeWebPath = (p) => p.replace(process.cwd(), "").replace(/\\/g, "/");

    /* ===============================
       CREATE COURSE
    =============================== */

    const course = await Course.create({
      title,
      description,
      slug: slugify(title, { lower: true }),
      category,

      // 💰 Pricing
      price: Number(price),
      isPaid,
      validityDays,

      // 🔐 Access rules
      accessType,
      previewPages: finalPreviewPages,
      showAdsForFreeUsers,
      allowDownloadAfterPurchase,

      // 🧠 Meta
      level,
      language,
      duration,
      tags: tags ? tags.split(",") : [],

      // 📄 Main PDF
      pdf: {
        fileName: req.files.pdf[0].originalname,
        filePath: makeWebPath(req.files.pdf[0].path),
        fileSize: req.files.pdf[0].size,
      },

      // 🖼 Banner
      bannerImage: bannerUrl
        ? { url: bannerUrl }
        : req.files.banner
          ? {
              fileName: req.files.banner[0].originalname,
              filePath: makeWebPath(req.files.banner[0].path),
              fileSize: req.files.banner[0].size,
            }
          : undefined,

      // 📎 Attachments
      attachments: req.files.attachments
        ? req.files.attachments.map((f) => ({
            fileName: f.originalname,
            filePath: makeWebPath(f.path),
            fileSize: f.size,
            fileType: f.mimetype.includes("excel") ? "excel" : "other",
          }))
        : [],

      // 🔗 External links
      externalLinks: externalLinks ? JSON.parse(externalLinks) : [],

      createdBy: req.user.id,
      isPublished: true,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error("UPLOAD ERROR 👉", err);
    res.status(500).json({
      message: "Course creation failed",
    });
  }
};
/**
 * ===============================
 * ADMIN: DELETE COURSE
 * ===============================
 */
export const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  await course.deleteOne();
  res.json({ message: "Course deleted successfully" });
};

/**
 * ===============================
 * ADMIN: PUBLISH / UNPUBLISH
 * ===============================
 */
export const togglePublishCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.json({
    message: course.isPublished ? "Course published" : "Course unpublished",
    isPublished: course.isPublished,
  });
};
