const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");
const auth = require("../middleware/auth");
const { payRide } = require("../controllers/rideController");

// Public routes
router.get("/", rideController.getRides);
router.get("/:id", rideController.getRideById);

// Protected routes
router.use(auth);
router.post("/", rideController.createRide);

// Payment endpoint for a ride
router.put("/:id/pay", payRide);

// Place this BEFORE any router.put('/:id', ...) or similar
router.put("/:rideId/status", rideController.updateRideStatus);

router.put("/:id", rideController.updateRide);
router.delete("/:id", rideController.deleteRide);
router.get("/user/rides", rideController.getUserRides);

router.put(
  "/:rideId/passengers/:passengerId/status",
  rideController.updatePassengerStatus
);

// Ride history for a user
router.get("/history/:userId", rideController.getRideHistory);

module.exports = router;
