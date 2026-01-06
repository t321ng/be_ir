import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { requireRoles, allowSelfOrRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireRoles("admin"), createUser);
router.get("/", requireRoles("admin"), getUsers);
router.get("/:id", allowSelfOrRoles("admin"), getUserById);
router.put("/:id", allowSelfOrRoles("admin"), updateUser);
router.patch("/:id", allowSelfOrRoles("admin"), updateUser);
router.delete("/:id", requireRoles("admin"), deleteUser);

export default router;
