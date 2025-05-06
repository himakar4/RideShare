import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { Button } from "../ui/button";
import {
  Menu,
  X,
  User,
  LogOut,
  Car,
  Map,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const Navbar = () => {
  const { user, logout } = useUserContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You've been logged out of your account.",
    });
    navigate("/");
  };

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Car className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  ShareWheels
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            {user?.role === "rider" && (
              <Link
                to="/offer-ride"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Offer Ride
              </Link>
            )}
            {user?.role === "passenger" && (
              <Link
                to="/find-rides"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Rides
              </Link>
            )}
            <Link
              to="/messages"
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
            >
              Messages
            </Link>
            <Link
              to="/ride-history"
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
            >
              Ride History
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <User className="h-4 w-4 mr-1" /> Profile
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut href="/home" className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
            {user?.role === "rider" && (
              <Link
                to="/offer-ride"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                onClick={toggleMenu}
              >
                Offer Ride
              </Link>
            )}
            {user?.role === "passenger" && (
              <Link
                to="/find-rides"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                onClick={toggleMenu}
              >
                Find Rides
              </Link>
            )}
            <Link
              to="/messages"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Messages
            </Link>
            <Link
              to="/ride-history"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Ride History
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
