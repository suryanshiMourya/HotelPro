
const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      addressLine: {
        type: String,
        default: ""
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        default: "",
        trim: true
      },
      country: {
        type: String,
        default: "India",
        trim: true
      },
      postalCode: {
        type: String,
        default: ""
      }
    },
    contactPhone: {
      type: String,
      default: ""
    },
    contactEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true
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

module.exports = mongoose.model("Hotel", hotelSchema);
