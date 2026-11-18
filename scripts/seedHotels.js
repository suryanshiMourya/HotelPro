
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

const hotelsData = [
  {
    name: "HotelPro Central Indore (Demo)",
    description: "A demonstration hotel featuring comfortable rooms, modern facilities and convenient access to central Indore.",
    address: {
      addressLine: "MG Road - Sample Address",
      city: "Indore",
      state: "Madhya Pradesh",
      country: "India",
      postalCode: "452001"
    },
    amenities: ["WiFi", "Restaurant", "Parking", "Air Conditioning"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"
    ],
    rooms: [
      {
        roomNumber: "201",
        roomType: "Deluxe",
        pricePerNight: 3500,
        capacity: 2,
        amenities: ["WiFi", "AC", "TV"]
      },
      {
        roomNumber: "202",
        roomType: "Suite",
        pricePerNight: 5500,
        capacity: 3,
        amenities: ["WiFi", "AC", "TV", "Balcony"]
      }
    ]
  },

  {
    name: "HotelPro Lakeview Bhopal (Demo)",
    description: "A sample lakeside hotel listing with elegant interiors, dining facilities and comfortable accommodation.",
    address: {
      addressLine: "VIP Road - Sample Address",
      city: "Bhopal",
      state: "Madhya Pradesh",
      country: "India",
      postalCode: "462001"
    },
    amenities: ["WiFi", "Restaurant", "Lake View", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200"
    ],
    rooms: [
      {
        roomNumber: "101",
        roomType: "Double",
        pricePerNight: 2800,
        capacity: 2,
        amenities: ["WiFi", "AC", "TV"]
      },
      {
        roomNumber: "102",
        roomType: "Deluxe",
        pricePerNight: 4200,
        capacity: 3,
        amenities: ["WiFi", "AC", "Lake View"]
      }
    ]
  },

  {
    name: "HotelPro Heritage Ujjain (Demo)",
    description: "A sample heritage-style hotel listing designed for visitors exploring Ujjain and its cultural attractions.",
    address: {
      addressLine: "Mahakal Area - Sample Address",
      city: "Ujjain",
      state: "Madhya Pradesh",
      country: "India",
      postalCode: "456001"
    },
    amenities: ["WiFi", "Restaurant", "Parking", "Room Service"],
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200"
    ],
    rooms: [
      {
        roomNumber: "301",
        roomType: "Single",
        pricePerNight: 1800,
        capacity: 1,
        amenities: ["WiFi", "AC"]
      },
      {
        roomNumber: "302",
        roomType: "Double",
        pricePerNight: 2600,
        capacity: 2,
        amenities: ["WiFi", "AC", "TV"]
      }
    ]
  },

  {
    name: "HotelPro Royal Jaipur (Demo)",
    description: "A demonstration royal-style property with traditional-inspired interiors and modern guest amenities.",
    address: {
      addressLine: "MI Road - Sample Address",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      postalCode: "302001"
    },
    amenities: ["WiFi", "Swimming Pool", "Restaurant", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200"
    ],
    rooms: [
      {
        roomNumber: "401",
        roomType: "Deluxe",
        pricePerNight: 4500,
        capacity: 2,
        amenities: ["WiFi", "AC", "TV"]
      },
      {
        roomNumber: "402",
        roomType: "Suite",
        pricePerNight: 7500,
        capacity: 4,
        amenities: ["WiFi", "AC", "TV", "Mini Bar"]
      }
    ]
  },

  {
    name: "HotelPro Seaside Goa (Demo)",
    description: "A sample beachside resort listing with a swimming pool, dining facilities and relaxing holiday accommodation.",
    address: {
      addressLine: "Candolim - Sample Address",
      city: "Goa",
      state: "Goa",
      country: "India",
      postalCode: "403515"
    },
    amenities: ["WiFi", "Swimming Pool", "Beach Access", "Restaurant"],
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200"
    ],
    rooms: [
      {
        roomNumber: "501",
        roomType: "Double",
        pricePerNight: 5000,
        capacity: 2,
        amenities: ["WiFi", "AC", "TV"]
      },
      {
        roomNumber: "502",
        roomType: "Suite",
        pricePerNight: 8500,
        capacity: 4,
        amenities: ["WiFi", "AC", "Balcony", "Sea View"]
      }
    ]
  }
];

const seedHotels = async () => {
  try {
    await connectDB();

    // Find existing admin account
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      throw new Error(
        "Admin account not found. Create your admin account first."
      );
    }

    let hotelCount = 0;
    let roomCount = 0;

    for (const data of hotelsData) {
      // Avoid duplicate hotels
      let hotel = await Hotel.findOne({
        name: data.name,
        "address.city": data.address.city
      });

      if (!hotel) {
        hotel = await Hotel.create({
          name: data.name,
          description: data.description,
          address: data.address,
          amenities: data.amenities,
          images: data.images,
          contactEmail: "demo@example.com",
          contactPhone: "",
          createdBy: admin._id,
          isActive: true
        });

        hotelCount++;
        console.log("Hotel created:", hotel.name);
      } else {
        console.log("Hotel already exists:", hotel.name);
      }

      // Add sample rooms
      for (const roomData of data.rooms) {
        const existingRoom = await Room.findOne({
          hotel: hotel._id,
          roomNumber: roomData.roomNumber
        });

        if (!existingRoom) {
          await Room.create({
            hotel: hotel._id,
            roomNumber: roomData.roomNumber,
            roomType: roomData.roomType,
            description: "Sample room for HotelPro demonstration.",
            pricePerNight: roomData.pricePerNight,
            capacity: roomData.capacity,
            amenities: roomData.amenities,
            images: [],
            createdBy: admin._id,
            isActive: true
          });

          roomCount++;
        }
      }
    }

    console.log("--------------------------------");
    console.log("HotelPro sample data ready!");
    console.log("New hotels created:", hotelCount);
    console.log("New rooms created:", roomCount);
    console.log("--------------------------------");

  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedHotels();
