import express from "express";
import {
  createIrCode,
  getAllIrCodes,
  getPublicIrCodes,
  getIrCodeById,
  updateIrCode,
  deleteIrCode,
  getIrCodesWithActions,
} from "../controllers/irCodeController.js";

const router = express.Router();

// IR Code routes
router.post("/", createIrCode); // Create new IR code
router.get("/", getAllIrCodes); // Get all IR codes for user
router.get("/public", getPublicIrCodes); // Get public IR codes (library)
router.get("/action", getIrCodesWithActions); // Get IR code IDs + actions by type and brand
router.get("/:id", getIrCodeById); // Get single IR code
router.put("/:id", updateIrCode); // Update IR code
router.patch("/:id", updateIrCode); // Update IR code (alternative)
router.delete("/:id", deleteIrCode); // Delete IR code

export default router;
