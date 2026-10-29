
const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");

// CREATE HOTEL — Admin only
const createHotel = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      contactPhone,
      contactEmail,
      amenities,
      images
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !address ||
      typeof address.city !== "string" ||
      !address.city.trim()
    ) {
      return res.status(400).json({
        message: "Hotel name, description and city are required"
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

    const hotel = await Hotel.create({
      name: name.trim(),
      description: description.trim(),
      address,
      contactPhone,
      contactEmail,
      amenities,
      images,
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: "Hotel created successfully",
      hotel
    });
  } catch (error) {
    console.error("Create hotel error:", error.message);

    return res.status(500).json({
      message: "Failed to create hotel"
    });
  }
};

// GET ALL ACTIVE HOTELS — Public
const getHotels = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (typeof req.query.city === "string" && req.query.city.trim()) {
      filter["address.city"] = {
        $regex: req.query.city.trim().replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        $options: "i"
      };
    }

    const hotels = await Hotel.find(filter)
      .select("-createdBy")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: hotels.length,
      hotels
    });
  } catch (error) {
    console.error("Get hotels error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch hotels"
    });
  }
};

// GET HOTEL BY ID — Public
const getHotelById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid hotel ID"
      });
    }

    const hotel = await Hotel.findOne({
      _id: req.params.id,
      isActive: true
    }).select("-createdBy");

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    return res.status(200).json({ hotel });
  } catch (error) {
    console.error("Get hotel error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch hotel"
    });
  }
};

// UPDATE HOTEL — Admin only
const updateHotel = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid hotel ID"
      });
    }

    const allowedFields = [
      "name",
      "description",
      "address",
      "contactPhone",
      "contactEmail",
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
        message: "No valid fields provided for update"
      });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    return res.status(200).json({
      message: "Hotel updated successfully",
      hotel
    });
  } catch (error) {
    console.error("Update hotel error:", error.message);

    return res.status(500).json({
      message: "Failed to update hotel"
    });
  }
};

// DELETE HOTEL — Admin only
// Soft delete: hide the hotel without removing its database record.
const deleteHotel = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid hotel ID"
      });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    return res.status(200).json({
      message: "Hotel deactivated successfully"
    });
  } catch (error) {
    console.error("Delete hotel error:", error.message);

    return res.status(500).json({
      message: "Failed to deactivate hotel"
    });
  }
};

module.exports = {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
};
