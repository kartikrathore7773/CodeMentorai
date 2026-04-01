import Service from "../../models/Service.js";
import Enquiry from "../../models/Enquiry.js";
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

export const getServiceBySlug = async (req, res) => {
  const service = await Service.findOneAndUpdate(
    { slug: req.params.slug, isActive: true },
    { $inc: { views: 1 } },
    { new: true },
  );

  if (!service) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true, data: service });
};

// User create enqury

/* ================= CREATE ENQUIRY ================= */

export const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, message, budget, serviceSlug } = req.body;

    let service = null;

    if (serviceSlug) {
      service = await Service.findOne({ slug: serviceSlug });
    }

    // Fallback for direct contact submissions when no service is configured.
    if (!service) {
      service = await Service.findOne({ slug: "general-consultation" });
    }

    if (!service) {
      service = await Service.create({
        title: "General Consultation",
        slug: "general-consultation",
        shortDescription: "General project enquiry",
        description:
          "Auto-created fallback service for direct contact form submissions.",
        category: "other",
        isActive: true,
      });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      message,
      budget,
      service: service._id,
    });

    service.enquiries += 1;
    await service.save();

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
