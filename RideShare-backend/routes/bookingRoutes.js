const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  bookVehicle,
  cancelBooking,
  getMyBookings,
  getDriverBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

// @route   POST /api/bookings
// @desc    Book a vehicle
// @access  Private
router.post("/", auth, bookVehicle);

// @route   GET /api/bookings/passenger
// @desc    Get passenger's bookings
// @access  Private
router.get("/passenger", auth, getMyBookings);

// @route   GET /api/bookings/driver
// @desc    Get driver's bookings
// @access  Private
router.get("/driver", auth, getDriverBookings);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put("/:id/status", auth, updateBookingStatus);

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete("/:id", auth, cancelBooking);

module.exports = router;
