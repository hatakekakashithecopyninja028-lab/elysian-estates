import express from "express";
import { login, getMe, changePassword, seedAdmin } from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/seed", seedAdmin);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

export default router;
