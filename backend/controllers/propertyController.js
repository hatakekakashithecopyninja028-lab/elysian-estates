import Property from "../models/Property.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/apiResponse.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllProperties = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, type, location, minPrice, maxPrice,
    featured, status, search, sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (location) filter.location = { $regex: location, $options: "i" };
  if (status) filter.status = status;
  if (featured === "true") filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [properties, total] = await Promise.all([
    Property.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Property.countDocuments(filter),
  ]);

  sendPaginated(res, properties, total, page, limit, "Properties fetched");
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return sendError(res, "Property not found", 404);
  sendSuccess(res, property, "Property fetched");
});

export const getFeaturedProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ featured: true, status: "Available" })
    .sort("-createdAt").limit(6);
  sendSuccess(res, properties, "Featured properties fetched");
});

export const getLatestProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ status: "Available" })
    .sort("-createdAt").limit(6);
  sendSuccess(res, properties, "Latest properties fetched");
});

export const createProperty = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.files?.thumbnail?.[0]) {
    data.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
  }
  if (req.files?.images) {
    data.images = req.files.images.map((f) => `/uploads/${f.filename}`);
  }

  const property = await Property.create(data);
  sendSuccess(res, property, "Property created", 201);
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return sendError(res, "Property not found", 404);

  const data = { ...req.body };

  if (req.files?.thumbnail?.[0]) {
    if (property.thumbnail) deleteFile(property.thumbnail);
    data.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
  }
  if (req.files?.images) {
    if (property.images?.length) property.images.forEach(deleteFile);
    data.images = req.files.images.map((f) => `/uploads/${f.filename}`);
  }

  const updated = await Property.findByIdAndUpdate(req.params.id, data, {
    new: true, runValidators: true,
  });
  sendSuccess(res, updated, "Property updated");
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return sendError(res, "Property not found", 404);

  if (property.thumbnail) deleteFile(property.thumbnail);
  if (property.images?.length) property.images.forEach(deleteFile);

  await property.deleteOne();
  sendSuccess(res, null, "Property deleted");
});

export const toggleFeatured = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return sendError(res, "Property not found", 404);
  property.featured = !property.featured;
  await property.save();
  sendSuccess(res, property, `Property ${property.featured ? "featured" : "unfeatured"}`);
});

function deleteFile(filePath) {
  try {
    const full = path.join(__dirname, "..", filePath);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch {}
}
