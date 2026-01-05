import express from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAllRooms,
} from "../controllers/roomController.js";

const router = express.Router();

// Room routes
router.post("/", createRoom); // Create new room
router.get("/", getRooms); // Get all rooms for USER
router.get("/all", getAllRooms); // Get all rooms (admin only)
router.get("/:id", getRoomById); // Get single room
router.put("/:id", updateRoom); // Update room
router.patch("/:id", updateRoom); // Update room (alternative)
router.delete("/:id", deleteRoom); // Delete room

export default router;
