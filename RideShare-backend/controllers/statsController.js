const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

exports.getStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total rides
    const totalRides = await Ride.countDocuments({ status: 'completed' });

    // Calculate total savings
    const completedBookings = await Booking.find({ 
      status: 'completed',
      paymentStatus: 'paid'
    });
    
    const totalSavings = completedBookings.reduce((acc, booking) => {
      return acc + (booking.price || 0);
    }, 0);

    // Get recent activity only if there is any
    let recentActivity = {
      rides: [],
      bookings: []
    };

    // Only fetch recent rides if there are any rides in the database
    const hasRides = await Ride.exists({});
    if (hasRides) {
      recentActivity.rides = await Ride.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('driver', 'name');
    }

    // Only fetch recent bookings if there are any bookings in the database
    const hasBookings = await Booking.exists({});
    if (hasBookings) {
      recentActivity.bookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('passenger', 'name')
        .populate('ride');
    }

    res.json({
      totalUsers: totalUsers || 0,
      totalRides: totalRides || 0,
      totalSavings: totalSavings || 0,
      recentActivity,
      isEmpty: {
        users: totalUsers === 0,
        rides: totalRides === 0,
        bookings: completedBookings.length === 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
}; 