const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

exports.bookVehicle = async (req, res) => {
  try {
    console.log("Booking payload received:", req.body);

    const {
      ride,
      seats,
      pickupLocation,
      dropoffLocation,
      price,
      specialRequests,
      status = "pending",
    } = req.body;

    const passenger = req.user._id;

    if (!ride || !seats || !pickupLocation || !dropoffLocation || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Fetch the ride to get the rider ID
    const rideDetails = await Ride.findById(ride);
    if (!rideDetails) {
      return res.status(404).json({ error: "Ride not found" });
    }

    const driver = rideDetails.driver;

    const booking = new Booking({
      ride,
      passenger,
      driver,
      seats,
      pickupLocation,
      dropoffLocation,
      price,
      specialRequests,
      status,
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("driver", "name email phone")
      .populate("ride");

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Booking creation failed:", error);
    res.status(500).json({ error: "Failed to book ride" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    console.log("Fetching passenger bookings for user:", req.user._id);
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate("ride")
      .populate("driver", "name email phone")
      .populate("passenger", "name email phone")
      .sort({ createdAt: -1 });

    console.log("Passenger bookings found:", bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching passenger bookings:", error);
    res.status(500).json({
      message: "Failed to fetch passenger bookings",
      error: error.message,
    });
  }
};

exports.getDriverBookings = async (req, res) => {
  console.log("Fetching driver bookings for user:", req.user._id);
  try {
    const bookings = await Booking.find({ driver: req.user._id })
      .populate("ride")
      .populate("passenger", "name email phone")
      .populate("driver", "name email phone")
      .sort({ createdAt: -1 });

    console.log("Driver bookings found:", bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching driver bookings:", error);
    res.status(500).json({
      message: "Failed to fetch driver bookings",
      error: error.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if user is authorized (must be the driver)
    if (booking.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // If booking is accepted, update the ride's available seats and passenger status
    if (status === "accepted") {
      const ride = await Ride.findById(booking.ride);
      if (ride) {
        // Find the passenger in the ride's passengers array
        let passenger = ride.passengers.find(
          (p) => p.user.toString() === booking.passenger.toString()
        );
        if (passenger) {
          passenger.status = "confirmed";
          passenger.paymentStatus = "pending";
        } else {
          // Add the passenger if not present
          ride.passengers.push({
            user: booking.passenger,
            seats: booking.seats,
            status: "confirmed",
            paymentStatus: "pending",
            pickupLocation: {
              address: booking.pickupLocation,
              // coordinates: add if available in booking
            },
          });
        }
        ride.availableSeats -= booking.seats;
        await ride.save();
      }
    }

    // Return updated booking with populated fields
    const updatedBooking = await Booking.findById(id)
      .populate("ride")
      .populate("passenger", "name email phone")
      .populate("driver", "name email phone");

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};
