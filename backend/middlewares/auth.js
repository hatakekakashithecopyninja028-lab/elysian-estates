import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { sendError } from "../utils/apiResponse.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, "Not authorized, no token", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "serene_mansion_secret");
    req.admin = await Admin.findById(decoded.id).select("-password");
    if (!req.admin) return sendError(res, "Admin not found", 401);
    next();
  } catch (err) {
    return sendError(res, "Not authorized, token invalid", 401);
  }
};
