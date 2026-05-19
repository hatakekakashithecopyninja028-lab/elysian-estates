import Enquiry from "../models/Enquiry.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/apiResponse.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const submitEnquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, message, propertyInterested } = req.body;

  if (!name || !email || !phone || !message) {
    return sendError(res, "Please fill all required fields", 400);
  }

  const enquiry = await Enquiry.create({ name, email, phone, message, propertyInterested });
  sendSuccess(res, enquiry, "Enquiry submitted successfully", 201);
});

export const getAllEnquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { propertyInterested: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
    Enquiry.countDocuments(filter),
  ]);

  sendPaginated(res, enquiries, total, page, limit, "Enquiries fetched");
});

export const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) return sendError(res, "Enquiry not found", 404);
  sendSuccess(res, enquiry, "Enquiry fetched");
});

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["New", "Contacted", "Closed"].includes(status))
    return sendError(res, "Invalid status", 400);

  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id, { status }, { new: true }
  );
  if (!enquiry) return sendError(res, "Enquiry not found", 404);
  sendSuccess(res, enquiry, "Enquiry status updated");
});

export const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) return sendError(res, "Enquiry not found", 404);
  sendSuccess(res, null, "Enquiry deleted");
});
