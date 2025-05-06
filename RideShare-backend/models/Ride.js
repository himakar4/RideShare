const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicle: {
    model: { type: String, required: true },
    color: { type: String },
    licensePlate: { type: String, required: true },
  },
  from: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  to: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  departureTime: { type: Date, required: true },
  estimatedDuration: Number,
  availableSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "cancelled"],
    default: "scheduled",
  },
  passengers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      seats: { type: Number, default: 1 },
      status: {
        type: String,
        enum: ["pending", "confirmed", "rejected", "cancelled"],
        default: "pending",
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
      },
      pickupLocation: {
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
    },
  ],
  rules: [String],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ride", rideSchema);
