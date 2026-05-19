import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "serene_mansion_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return sendError(res, "Please provide email and password", 400);

  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin || !(await admin.matchPassword(password)))
    return sendError(res, "Invalid credentials", 401);

  const token = signToken(admin._id);
  sendSuccess(res, { token, admin }, "Login successful");
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, req.admin, "Admin profile fetched");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id).select("+password");

  if (!(await admin.matchPassword(currentPassword)))
    return sendError(res, "Current password is incorrect", 400);
  if (newPassword.length < 6)
    return sendError(res, "New password must be at least 6 characters", 400);

  admin.password = newPassword;
  await admin.save();
  sendSuccess(res, null, "Password updated successfully");
});

export const seedAdmin = asyncHandler(async (req, res) => {
  const existing = await Admin.findOne({ email: "admin@serenemansion.com" });
  if (existing) return sendError(res, "Admin already seeded", 400);

  const admin = await Admin.create({
    name: "Super Admin",
    email: "admin@serenemansion.com",
    password: "Admin@123",
  });
  sendSuccess(res, admin, "Admin seeded successfully", 201);
});
