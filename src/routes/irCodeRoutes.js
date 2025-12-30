import express from "express";
import {
  createIrCode,
  getIrCodes,
  getPublicIrCodes,
  getIrCodeById,
  updateIrCode,
  deleteIrCode,
  searchIrCodes,
  getIrCodesByBrand,
  getIrCodesByDeviceType,
  getActionsByDeviceType,
} from "../controllers/irCodeController.js";

const router = express.Router();

// IR Code routes
router.post("/", createIrCode); // Create new IR code
router.get("/", getIrCodes); // Get IR codes for user
router.get("/public", getPublicIrCodes); // Get public IR codes (library)
router.get("/search", searchIrCodes); // Search IR codes
router.get("/brand/:brand", getIrCodesByBrand); // Get IR codes by brand
router.get("/type/:type", getIrCodesByDeviceType); // Get IR codes by device type
router.get("/type/:type/actions", getActionsByDeviceType); // Get actions for device type
router.get("/:id", getIrCodeById); // Get single IR code
router.put("/:id", updateIrCode); // Update IR code
router.patch("/:id", updateIrCode); // Update IR code (alternative)
router.delete("/:id", deleteIrCode); // Delete IR code

export default router;
