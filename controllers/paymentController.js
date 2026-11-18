
const mongoose = require("mongoose");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// ========================================
// CHECK MOCK PAYMENT MODE
// ========================================
const checkMockPaymentMode = (res) => {
  if (
    process.env.MOCK_PAYMENTS_ENABLED !== "true" ||
    process.env.NODE_ENV === "production"
  ) {
    res.status(403).json({
      message: "Mock payments are available only in local development"
    });

    return false;
  }

  return true;
};

// ========================================
// 1. CREATE MOCK PAYMENT
// Logged-in Guest
// ========================================
const createMockPayment = async (req, res) => {
  try {
    if (!checkMockPaymentMode(res)) return;

    const { bookingId, paymentMethod } = req.body;

    if (
      typeof bookingId !== "string" ||
      !mongoose.isValidObjectId(bookingId)
    ) {
      return res.status(400).json({
        message: "Valid booking ID is required"
      });
    }

    const allowedMethods = ["UPI", "Card", "Cash"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Payment method must be UPI, Card or Cash"
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // Verify booking owner
    if (booking.guest.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You cannot pay for this booking"
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot pay for a cancelled booking"
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(409).json({
        message: "Booking is already paid"
      });
    }

    if (
      typeof booking.totalAmount !== "number" ||
      !Number.isFinite(booking.totalAmount) ||
      booking.totalAmount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid booking amount"
      });
    }

    // Find existing payment for this booking
    let payment = await Payment.findOne({
      booking: bookingId
    });

    if (payment && payment.paymentStatus === "paid") {
      return res.status(409).json({
        message: "Payment is already completed"
      });
    }

    // Generate unique mock payment reference
    const mockReference =
      "MOCK-" +
      Date.now() +
      "-" +
      crypto.randomBytes(5).toString("hex").toUpperCase();

    const isExistingPayment = Boolean(payment);

    if (!payment) {
      payment = new Payment({
        booking: booking._id,
        user: req.user.id
      });
    }

    // Save server-calculated amount
    payment.amount = booking.totalAmount;
    payment.currency = "INR";
    payment.paymentMethod = paymentMethod;
    payment.paymentStatus = "pending";
    payment.mockReference = mockReference;
    payment.transactionId = null;
    payment.paymentGateway = "HotelPro Mock Gateway";

    await payment.save();

    return res.status(isExistingPayment ? 200 : 201).json({
      message: "Mock payment created successfully",
      instruction: "Use the mock complete endpoint to simulate success or failure",
      payment: {
        _id: payment._id,
        booking: payment.booking,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        mockReference: payment.mockReference,
        paymentGateway: payment.paymentGateway
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Payment reference conflict. Please retry."
      });
    }

    console.error("Create mock payment error:", error);

    return res.status(500).json({
      message: "Failed to create mock payment"
    });
  }
};


// ========================================
// 2. COMPLETE MOCK PAYMENT
// Logged-in Guest
// ========================================
const completeMockPayment = async (req, res) => {
  try {
    if (!checkMockPaymentMode(res)) return;

    const { paymentId, outcome } = req.body;

    if (
      typeof paymentId !== "string" ||
      !mongoose.isValidObjectId(paymentId)
    ) {
      return res.status(400).json({
        message: "Valid payment ID is required"
      });
    }

    if (!["success", "failure"].includes(outcome)) {
      return res.status(400).json({
        message: "Outcome must be success or failure"
      });
    }

    // Find payment belonging to logged-in user
    const payment = await Payment.findOne({
      _id: paymentId,
      user: req.user.id
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    if (payment.paymentStatus === "paid") {
      return res.status(409).json({
        message: "Payment is already completed"
      });
    }

    if (payment.paymentStatus !== "pending") {
      return res.status(409).json({
        message: "Payment is not pending. Create a new attempt."
      });
    }

    // Find associated booking
    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return res.status(404).json({
        message: "Associated booking not found"
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot complete payment for a cancelled booking"
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(409).json({
        message: "Booking is already paid"
      });
    }

    // ------------------------------------
    // SIMULATE PAYMENT FAILURE
    // ------------------------------------
    if (outcome === "failure") {
      payment.paymentStatus = "failed";
      payment.transactionId = null;

      await payment.save();

      return res.status(200).json({
        message: "Mock payment failure simulated",
        paymentStatus: "failed",
        bookingPaymentStatus: booking.paymentStatus,
        note: "No actual money was charged"
      });
    }

    // ------------------------------------
    // SIMULATE PAYMENT SUCCESS
    // ------------------------------------
    const transactionId =
      "MOCK-TXN-" +
      Date.now() +
      "-" +
      crypto.randomBytes(5).toString("hex").toUpperCase();

    payment.paymentStatus = "paid";
    payment.transactionId = transactionId;

    await payment.save();

    // Update only the correct owner's unpaid,
    // non-cancelled booking.
    try {
      const updatedBooking = await Booking.findOneAndUpdate(
        {
          _id: payment.booking,
          guest: req.user.id,
          status: { $ne: "cancelled" },
          paymentStatus: { $ne: "paid" }
        },
        {
          $set: {
            paymentStatus: "paid"
          }
        },
        {
          new: true
        }
      );

      if (!updatedBooking) {
        // Roll back payment status if booking could not update
        payment.paymentStatus = "pending";
        payment.transactionId = null;
        await payment.save();

        return res.status(409).json({
          message: "Booking could not be marked as paid"
        });
      }

      return res.status(200).json({
        message: "Mock payment successful",
        note: "This is a simulated payment. No actual money was charged.",
        payment: {
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          transactionId: payment.transactionId
        },
        booking: {
          id: updatedBooking._id,
          status: updatedBooking.status,
          paymentStatus: updatedBooking.paymentStatus
        }
      });

    } catch (bookingError) {
      // Try to restore pending payment if booking update fails
      payment.paymentStatus = "pending";
      payment.transactionId = null;
      await payment.save();

      throw bookingError;
    }

  } catch (error) {
    console.error("Complete mock payment error:", error);

    return res.status(500).json({
      message: "Failed to complete mock payment"
    });
  }
};


// ========================================
// 3. GET MY PAYMENT HISTORY
// Logged-in Guest
// ========================================
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id
    })
      .populate({
        path: "booking",
        populate: [
          {
            path: "hotel",
            select: "name address"
          },
          {
            path: "room",
            select: "roomNumber roomType"
          }
        ]
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Payment history fetched successfully",
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error("Get my payments error:", error);

    return res.status(500).json({
      message: "Failed to fetch payment history"
    });
  }
};


// ========================================
// 4. GET ALL PAYMENTS
// Admin Only
// ========================================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: [
          {
            path: "hotel",
            select: "name"
          },
          {
            path: "room",
            select: "roomNumber roomType"
          }
        ]
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All payments fetched successfully",
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error("Get all payments error:", error);

    return res.status(500).json({
      message: "Failed to fetch all payments"
    });
  }
};


// ========================================
// 5. GET PAYMENT BY ID
// Owner or Admin
// ========================================
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid payment ID"
      });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    const isOwner =
      payment.user.toString() === req.user.id;

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You cannot access this payment"
      });
    }

    await payment.populate("user", "name email");

    await payment.populate({
      path: "booking",
      populate: [
        {
          path: "hotel",
          select: "name address"
        },
        {
          path: "room",
          select: "roomNumber roomType"
        }
      ]
    });

    return res.status(200).json({
      message: "Payment fetched successfully",
      payment
    });

  } catch (error) {
    console.error("Get payment error:", error);

    return res.status(500).json({
      message: "Failed to fetch payment"
    });
  }
};


// ========================================
// EXPORT ALL PAYMENT FUNCTIONS
// ========================================
module.exports = {
  createMockPayment,
  completeMockPayment,
  getMyPayments,
  getAllPayments,
  getPaymentById
};
