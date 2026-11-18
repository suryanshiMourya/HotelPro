
const express = require("express");
const router = express.Router();

const {
  createMockPayment,
  completeMockPayment,
  getMyPayments,
  getAllPayments,
  getPaymentById
} = require("../controllers/paymentController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

// Guest: create simulated payment
router.post(
  "/mock/create",
  protect,
  createMockPayment
);

// Guest: simulate success or failure
router.post(
  "/mock/complete",
  protect,
  completeMockPayment
);

// Guest: view own payment history
router.get(
  "/my",
  protect,
  getMyPayments
);

// Admin: view all payments
router.get(
  "/",
  protect,
  adminOnly,
  getAllPayments
);

// Owner or admin: view one payment
router.get(
  "/:id",
  protect,
  getPaymentById
);

module.exports = router;
