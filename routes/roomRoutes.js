
const express = require("express");
const router = express.Router();

const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
} = require("../controllers/roomController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getRooms);
router.get("/:id", getRoomById);

// Admin-only routes
router.post("/", protect, adminOnly, createRoom);
router.put("/:id", protect, adminOnly, updateRoom);
router.delete("/:id", protect, adminOnly, deleteRoom);

module.exports = router;
