import express from "express";
import {
  getAllProperties, getProperty, getFeaturedProperties,
  getLatestProperties, createProperty, updateProperty,
  deleteProperty, toggleFeatured,
} from "../controllers/propertyController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

const propertyUpload = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

router.get("/", getAllProperties);
router.get("/featured", getFeaturedProperties);
router.get("/latest", getLatestProperties);
router.get("/:id", getProperty);

router.post("/", protect, propertyUpload, createProperty);
router.put("/:id", protect, propertyUpload, updateProperty);
router.delete("/:id", protect, deleteProperty);
router.patch("/:id/toggle-featured", protect, toggleFeatured);

export default router;
