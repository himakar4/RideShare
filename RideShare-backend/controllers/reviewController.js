const Review = require("../models/Review");
const User = require("../models/User");
const mongoose = require("mongoose");

// Create a review and update the reviewee's average rating
exports.createReview = async (req, res) => {
  try {
    const { ride, reviewee, rating, comment } = req.body;
    const reviewer = req.user._id;

    // Prevent duplicate reviews
    const existing = await Review.findOne({ ride, reviewer });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this ride." });
    }

    const review = new Review({ ride, reviewer, reviewee, rating, comment });
    await review.save();

    // Recalculate average rating for the reviewee (driver)
    const reviews = await Review.find({ reviewee });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

    await User.findByIdAndUpdate(reviewee, { rating: avgRating });

    res.status(201).json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create review", error: error.message });
  }
};

// Get reviews for a user (driver)
exports.getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId }).populate(
      "reviewer",
      "name"
    );
    res.json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch reviews", error: error.message });
  }
};

// Check if a review exists for a ride and user
exports.hasReviewed = async (req, res) => {
  try {
    const { rideId } = req.params;
    const reviewer = req.user._id;
    // Check for valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.json({ reviewed: false });
    }
    const review = await Review.findOne({ ride: rideId, reviewer });
    res.json({ reviewed: !!review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to check review", error: error.message });
  }
};
