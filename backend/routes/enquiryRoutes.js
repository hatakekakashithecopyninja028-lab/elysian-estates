import express from "express";
import {
  submitEnquiry, getAllEnquiries, getEnquiry,
  updateEnquiryStatus, deleteEnquiry,
} from "../controllers/enquiryController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", submitEnquiry);

router.get("/", protect, getAllEnquiries);
router.get("/:id", protect, getEnquiry);
router.patch("/:id/status", protect, updateEnquiryStatus);
router.delete("/:id", protect, deleteEnquiry);

export default router;
