
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    roomType: {
      type: String,
      enum: ["Single", "Double", "Deluxe", "Suite", "Family"],
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Room numbers must be unique within each hotel.
roomSchema.index(
  { hotel: 1, roomNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Room", roomSchema);
