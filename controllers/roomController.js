
const mongoose = require("mongoose");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

// CREATE ROOM — Admin only
const createRoom = async (req, res) => {
  try {
    const {
      hotelId,
      roomNumber,
      roomType,
      description,
      pricePerNight,
      capacity,
      amenities,
      images
    } = req.body;

    if (
      typeof hotelId !== "string" ||
      !mongoose.isValidObjectId(hotelId) ||
      typeof roomNumber !== "string" ||
      !roomNumber.trim() ||
      typeof roomType !== "string" ||
      !["Single", "Double", "Deluxe", "Suite", "Family"]
        .includes(roomType) ||
      typeof pricePerNight !== "number" ||
      !Number.isFinite(pricePerNight) ||
      pricePerNight < 0 ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return res.status(400).json({
        message: "Provide a valid hotelId, room number, room type, price and capacity"
      });
    }

    if (
      (amenities !== undefined && !Array.isArray(amenities)) ||
      (images !== undefined && !Array.isArray(images))
    ) {
      return res.status(400).json({
        message: "Amenities and images must be arrays"
      });
    }

    const hotel = await Hotel.findOne({
      _id: hotelId,
      isActive: true
    });

    if (!hotel) {
      return res.status(404).json({
        message: "Active hotel not found"
      });
    }

    const room = await Room.create({
      hotel: hotelId,
      roomNumber: roomNumber.trim(),
      roomType,
      description,
      pricePerNight,
      capacity,
      amenities,
      images,
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: "Room created successfully",
      room
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This room number already exists in the hotel"
      });
    }

    console.error("Create room error:", error.message);

    return res.status(500).json({
      message: "Failed to create room"
    });
  }
};

// GET ALL ACTIVE ROOMS — Public
const getRooms = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.hotelId !== undefined) {
      if (!mongoose.isValidObjectId(req.query.hotelId)) {
        return res.status(400).json({
          message: "Invalid hotel ID"
        });
      }

      filter.hotel = req.query.hotelId;
    }

    if (req.query.roomType !== undefined) {
      const allowedTypes = [
        "Single", "Double", "Deluxe", "Suite", "Family"
      ];

      if (!allowedTypes.includes(req.query.roomType)) {
        return res.status(400).json({
          message: "Invalid room type"
        });
      }

      filter.roomType = req.query.roomType;
    }

    if (req.query.maxPrice !== undefined) {
      const maxPrice = Number(req.query.maxPrice);

      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        return res.status(400).json({
          message: "Invalid maximum price"
        });
      }

      filter.pricePerNight = {
        ...(filter.pricePerNight || {}),
        $lte: maxPrice
      };
    }

    if (req.query.minPrice !== undefined) {
      const minPrice = Number(req.query.minPrice);

      if (!Number.isFinite(minPrice) || minPrice < 0) {
        return res.status(400).json({
          message: "Invalid minimum price"
        });
      }

      filter.pricePerNight = {
        ...(filter.pricePerNight || {}),
        $gte: minPrice
      };
    }

    const rooms = await Room.find(filter)
      .select("-createdBy")
      .populate("hotel", "name address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error("Get rooms error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch rooms"
    });
  }
};

// GET ONE ROOM — Public
const getRoomById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid room ID"
      });
    }

    const room = await Room.findOne({
      _id: req.params.id,
      isActive: true
    })
      .select("-createdBy")
      .populate("hotel", "name address");

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    return res.status(200).json({ room });
  } catch (error) {
    console.error("Get room error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch room"
    });
  }
};

// UPDATE ROOM — Admin only
const updateRoom = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid room ID"
      });
    }

    const allowedFields = [
      "roomNumber",
      "roomType",
      "description",
      "pricePerNight",
      "capacity",
      "amenities",
      "images",
      "isActive"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided"
      });
    }

    if (
      updates.roomNumber !== undefined &&
      (typeof updates.roomNumber !== "string" ||
        !updates.roomNumber.trim())
    ) {
      return res.status(400).json({
        message: "Room number must not be empty"
      });
    }

    if (
      updates.roomType !== undefined &&
      !["Single", "Double", "Deluxe", "Suite", "Family"]
        .includes(updates.roomType)
    ) {
      return res.status(400).json({
        message: "Invalid room type"
      });
    }

    if (
      updates.pricePerNight !== undefined &&
      (typeof updates.pricePerNight !== "number" ||
        !Number.isFinite(updates.pricePerNight) ||
        updates.pricePerNight < 0)
    ) {
      return res.status(400).json({
        message: "Price must be a non-negative number"
      });
    }

    if (
      updates.capacity !== undefined &&
      (!Number.isInteger(updates.capacity) ||
        updates.capacity < 1)
    ) {
      return res.status(400).json({
        message: "Capacity must be a positive integer"
      });
    }

    for (const field of ["amenities", "images"]) {
      if (
        updates[field] !== undefined &&
        !Array.isArray(updates[field])
      ) {
        return res.status(400).json({
          message: `${field} must be an array`
        });
      }
    }

    if (updates.roomNumber !== undefined) {
      updates.roomNumber = updates.roomNumber.trim();
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    return res.status(200).json({
      message: "Room updated successfully",
      room
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "That room number already exists in this hotel"
      });
    }

    console.error("Update room error:", error.message);

    return res.status(500).json({
      message: "Failed to update room"
    });
  }
};

// DEACTIVATE ROOM — Admin only
const deleteRoom = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid room ID"
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    return res.status(200).json({
      message: "Room deactivated successfully"
    });
  } catch (error) {
    console.error("Delete room error:", error.message);

    return res.status(500).json({
      message: "Failed to deactivate room"
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};
