
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// ========================================
// 1. CREATE BOOKING — Logged-in User
// ========================================
const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    // Validate room ID
    if (
      typeof roomId !== "string" ||
      !mongoose.isValidObjectId(roomId)
    ) {
      return res.status(400).json({
        message: "Valid room ID is required"
      });
    }

    // Validate number of guests
    if (
      typeof guests !== "number" ||
      !Number.isInteger(guests) ||
      guests < 1
    ) {
      return res.status(400).json({
        message: "Guest count must be a positive integer"
      });
    }

    // Validate date format: YYYY-MM-DD
    const isValidDate = (value) => {
      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      return res.status(400).json({
        message: "Use valid dates in YYYY-MM-DD format"
      });
    }

    const startDate = new Date(
      `${checkIn}T00:00:00.000Z`
    );

    const endDate = new Date(
      `${checkOut}T00:00:00.000Z`
    );

    if (endDate <= startDate) {
      return res.status(400).json({
        message: "Check-out must be after check-in"
      });
    }

    // Calculate number of nights
    const nights = Math.round(
      (endDate - startDate) /
      (1000 * 60 * 60 * 24)
    );

    // Find room and populate hotel information
    const room = await Room.findOne({
      _id: roomId,
      isActive: true
    }).populate("hotel");

    if (!room) {
      return res.status(404).json({
        message: "Room not found or inactive"
      });
    }

    // Check whether hotel exists and is active
    if (!room.hotel || !room.hotel.isActive) {
      return res.status(404).json({
        message: "Hotel not found or inactive"
      });
    }

    // Check room capacity
    if (guests > room.capacity) {
      return res.status(400).json({
        message: `Maximum capacity of this room is ${room.capacity} guests`
      });
    }

    // Check room availability for selected dates
    const existingBooking = await Booking.findOne({
      room: roomId,
      status: {
        $ne: "cancelled"
      },
      checkIn: {
        $lt: endDate
      },
      checkOut: {
        $gt: startDate
      }
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "Room is already booked for these dates"
      });
    }

    // Calculate total booking amount
    const pricePerNight = room.pricePerNight;
    const totalAmount = nights * pricePerNight;

    // Create new booking
    const booking = await Booking.create({
      guest: req.user.id,
      hotel: room.hotel._id,
      room: room._id,
      checkIn: startDate,
      checkOut: endDate,
      guests,
      nights,
      pricePerNight,
      totalAmount,
      status: "confirmed",
      paymentStatus: "pending"
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      message: "Failed to create booking"
    });
  }
};


// ========================================
// 2. GET MY BOOKINGS — Logged-in User
// ========================================
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      guest: req.user.id
    })
      .populate("hotel", "name address")
      .populate(
        "room",
        "roomNumber roomType pricePerNight capacity"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings fetched successfully",
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch bookings"
    });
  }
};


// ========================================
// 3. GET ALL BOOKINGS — Admin Only
// ========================================
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("guest", "name email")
      .populate("hotel", "name address")
      .populate(
        "room",
        "roomNumber roomType pricePerNight"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All bookings fetched successfully",
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error("Get all bookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch all bookings"
    });
  }
};


// ========================================
// 4. CANCEL BOOKING — Owner or Admin
// ========================================
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate booking ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID"
      });
    }

    // Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // Verify booking ownership
    const isOwner =
      booking.guest.toString() === req.user.id;

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to cancel this booking"
      });
    }

    // Check booking status
    if (
      booking.status === "checked_in" ||
      booking.status === "checked_out"
    ) {
      return res.status(400).json({
        message: "This booking cannot be cancelled"
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled"
      });
    }

    // Cancel booking
    booking.status = "cancelled";

    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      message: "Failed to cancel booking"
    });
  }
};


// ========================================
// EXPORT ALL BOOKING FUNCTIONS
// ========================================
module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking
};
