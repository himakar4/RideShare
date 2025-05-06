const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Ride = require("./models/Ride");
const Booking = require("./models/Booking");
const User = require("./models/User");

dotenv.config();

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const rideResult = await Ride.deleteMany({});
    console.log(`Deleted ${rideResult.deletedCount} rides.`);

    const bookingResult = await Booking.deleteMany({});
    console.log(`Deleted ${bookingResult.deletedCount} bookings.`);

    const userResult = await User.updateMany(
      {},
      { $set: { totalEarnings: 0, totalRides: 0 } }
    );
    console.log(
      `Reset stats for ${
        userResult.modifiedCount || userResult.nModified
      } users.`
    );

    await mongoose.disconnect();
    console.log("Database cleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error during cleanup:", err);
    process.exit(1);
  }
}

cleanDatabase();
