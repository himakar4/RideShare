const Ride = require("../models/Ride");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");

// Create a new ride offer
exports.createRide = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      "vehicle",
      "from",
      "to",
      "departureTime",
      "availableSeats",
      "pricePerSeat",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // Validate from and to fields
    if (!req.body.from.city || !req.body.from.address) {
      return res.status(400).json({
        message:
          'Missing required fields in "from" object: city and address are required',
      });
    }

    if (!req.body.to.city || !req.body.to.address) {
      return res.status(400).json({
        message:
          'Missing required fields in "to" object: city and address are required',
      });
    }

    // Validate vehicle details within the embedded object
    if (!req.body.vehicle.model || !req.body.vehicle.licensePlate) {
      return res.status(400).json({
        message:
          "Missing required vehicle details: model and licensePlate are required",
      });
    }

    // Create the ride
    const ride = new Ride({
      ...req.body,
      driver: req.user._id,
    });

    await ride.save();

    // Return the populated ride
    const populatedRide = await Ride.findById(ride._id)
      .populate("driver", "name rating profilePicture")
      .populate("vehicle", "make model year color seats");

    res.status(201).json(populatedRide);
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(400).json({
      message: "Error creating ride",
      error: error.message,
    });
  }
};

// Get all rides with filters
exports.getRides = async (req, res) => {
  try {
    const { from, to, date, seats } = req.query;
    const filter = {};

    if (from) filter["from.city"] = from;
    if (to) filter["to.city"] = to;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.departureTime = { $gte: startDate, $lt: endDate };
    }
    if (seats) filter.availableSeats = { $gte: parseInt(seats) };

    const rides = await Ride.find(filter)
      .populate("driver", "name rating profilePicture")
      .populate("vehicle", "make model year color seats")
      .sort({ departureTime: 1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ride by ID
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver", "name rating profilePicture phone")
      .populate("vehicle", "make model year color seats photos")
      .populate("passengers.user", "name rating profilePicture");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ride
exports.updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this ride" });
    }

    Object.assign(ride, req.body);
    await ride.save();

    res.json(ride);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete ride
exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this ride" });
    }

    // Check if there are any confirmed bookings for this ride
    const confirmedBookings = await Booking.find({
      ride: req.params.id,
      status: "confirmed",
    });

    if (confirmedBookings.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete ride with confirmed bookings. Please cancel or complete these bookings first.",
      });
    }

    // Delete all pending bookings associated with this ride
    await Booking.deleteMany({ ride: req.params.id, status: "pending" });

    // Now delete the ride
    await Ride.findByIdAndDelete(req.params.id);

    res.json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's rides (as driver or passenger)
exports.getUserRides = async (req, res) => {
  try {
    // Find rides where the user is either the driver or a passenger
    const userRides = await Ride.find({
      $or: [{ driver: req.user._id }, { "passengers.user": req.user._id }],
    })
      .populate("driver", "name rating profilePicture")
      .populate("vehicle", "make model year color seats")
      .populate("passengers.user", "name rating profilePicture")
      .sort({ departureTime: 1 });

    // Process the rides to ensure all required fields exist
    const processedRides = userRides.map((ride) => {
      // Ensure passengers array exists
      if (!ride.passengers) {
        ride.passengers = [];
      }

      // Ensure each passenger has the required fields
      ride.passengers = ride.passengers.map((passenger) => {
        if (!passenger.user) {
          passenger.user = {
            _id: null,
            name: "Unknown User",
            rating: 0,
            profilePicture: null,
          };
        }
        if (!passenger.rating) {
          passenger.rating = { score: 0, comment: "" };
        }
        return passenger;
      });

      return ride;
    });

    res.json(processedRides);
  } catch (error) {
    console.error("Error fetching user rides:", error);
    res.status(500).json({
      message: "Error fetching user rides",
      error: error.message,
    });
  }
};

// Mark payment as completed for a passenger in a ride
exports.payRide = async (req, res) => {
  try {
    const rideId = req.params.id;
    const userId = req.user._id;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    const passenger = ride.passengers.find(
      (p) => p.user.toString() === userId.toString() && p.status === "confirmed"
    );
    if (!passenger) {
      return res.status(404).json({
        message: "Passenger not found or not confirmed for this ride",
      });
    }
    passenger.paymentStatus = "completed";
    await ride.save();

    // Update driver's total earnings
    const driver = await User.findById(ride.driver);
    if (driver) {
      const earningsFromThisRide = ride.pricePerSeat * passenger.seats;
      driver.totalEarnings = (driver.totalEarnings || 0) + earningsFromThisRide;
      await driver.save();
    }

    res.json({ message: "Payment marked as completed" });
  } catch (error) {
    console.error("Error marking payment as completed:", error);
    res.status(500).json({
      message: "Failed to mark payment as completed",
      error: error.message,
    });
  }
};

// Update a passenger's status in a ride (e.g., cancel ride)
exports.updatePassengerStatus = async (req, res) => {
  try {
    const { rideId, passengerId } = req.params;
    const { status } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    const passenger = ride.passengers.id(passengerId);
    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }
    passenger.status = status;
    await ride.save();
    res.json({ message: "Passenger status updated" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update passenger status",
      error: error.message,
    });
  }
};

// Update ride status (e.g., to 'started')
exports.updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["scheduled", "started", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json({ message: "Ride status updated", ride });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get ride history for a user (completed and cancelled rides)
exports.getRideHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Completed rides: user is driver or confirmed passenger
    const completedRides = await Ride.find({
      status: "completed",
      $or: [
        { driver: userId },
        { passengers: { $elemMatch: { user: userId, status: "confirmed" } } },
      ],
    })
      .populate("driver", "name rating profilePicture")
      .populate("vehicle", "make model year color seats")
      .populate("passengers.user", "name rating profilePicture");

    // Cancelled rides: user is driver or cancelled/confirmed passenger
    const canceledRides = await Ride.find({
      status: "cancelled",
      $or: [
        { driver: userId },
        {
          passengers: {
            $elemMatch: {
              user: userId,
              status: { $in: ["confirmed", "cancelled"] },
            },
          },
        },
      ],
    })
      .populate("driver", "name rating profilePicture")
      .populate("vehicle", "make model year color seats")
      .populate("passengers.user", "name rating profilePicture");

    res.json({ completed: completedRides, canceled: canceledRides });
  } catch (error) {
    console.error("Error fetching ride history:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch ride history", error: error.message });
  }
};
