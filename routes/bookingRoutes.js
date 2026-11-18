
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking
} = require("../controllers/bookingController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

// Guest and admin routes
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

// Admin route
router.get("/", protect, adminOnly, getAllBookings);

// Cancel booking
router.patch("/:id/cancel", protect, cancelBooking);

module.exports = router;
