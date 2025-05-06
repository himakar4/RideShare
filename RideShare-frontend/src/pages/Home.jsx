import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { Button } from '../components/ui/button';
import { Car, Users, Globe, Shield } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const { user } = useUserContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    totalSavings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Connect, Share, and Travel Together
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Join our community of {stats.totalUsers}+ riders and passengers
              for a more affordable, sustainable, and social way to travel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="font-semibold">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="font-semibold">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="font-semibold bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose ShareWheels
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Car className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Cost-Effective Travel
              </h3>
              <p className="text-gray-600">
                Share the cost of your journey with others heading in the same
                direction. Our users have saved over ₹{stats.totalSavings}+ on
                travel expenses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Reduce Carbon Footprint
              </h3>
              <p className="text-gray-600">
                By sharing rides, you're helping to reduce traffic congestion
                and carbon emissions. We've facilitated {stats.totalRides}+
                shared rides so far.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Connections</h3>
              <p className="text-gray-600">
                Meet new people, share stories, and make your journey more
                enjoyable with like-minded travelers from our growing community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  1
                </span>
                For Riders
              </h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="mr-3 text-primary font-bold">➔</span>
                  <p>Sign up and complete your profile</p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-primary font-bold">➔</span>
                  <p>
                    Post your ride details including route, time, and available
                    seats
                  </p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-primary font-bold">➔</span>
                  <p>Accept booking requests from passengers</p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-primary font-bold">➔</span>
                  <p>Meet your passengers and enjoy shared journey</p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-primary font-bold">➔</span>
                  <p>Get paid and receive ratings after the trip</p>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  2
                </span>
                For Passengers
              </h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="mr-3 text-secondary font-bold">➔</span>
                  <p>Create your passenger account</p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-secondary font-bold">➔</span>
                  <p>
                    Search for available rides based on your route and schedule
                  </p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-secondary font-bold">➔</span>
                  <p>Request to book a seat in a ride you like</p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-secondary font-bold">➔</span>
                  <p>Receive confirmation from the rider</p>
                </li>
                <li className="flex">
                  <span className="mr-3 text-secondary font-bold">➔</span>
                  <p>Enjoy your journey and rate your experience</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-lg opacity-90">
            Join our growing community of {stats.totalUsers}+ riders and
            passengers today and experience a better way to travel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold bg-white text-primary hover:bg-gray-100"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-semibold bg-white text-primary hover:bg-white/20"
                  >
                    Sign Up Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-semibold border-white text-primary hover:bg-white/20"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trust and Safety Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Trust & Safety</h2>
            <p className="text-lg text-gray-700 mb-8">
              We take safety seriously. All users are verified, and our rating
              system helps maintain a community of trusted members. You can
              travel with confidence knowing that we've got your back.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
