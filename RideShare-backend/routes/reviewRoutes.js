const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const reviewController = require("../controllers/reviewController");

// POST /api/reviews - create a review
router.post("/", auth, reviewController.createReview);

// GET /api/reviews/user/:userId - get reviews for a user (driver)
router.get("/user/:userId", reviewController.getReviewsForUser);

// GET /api/reviews/ride/:rideId/has-reviewed - check if current user reviewed this ride
router.get("/ride/:rideId/has-reviewed", auth, reviewController.hasReviewed);

module.exports = router;
