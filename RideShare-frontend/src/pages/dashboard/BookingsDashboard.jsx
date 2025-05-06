import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import MainLayout from "../../components/layout/MainLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Calendar as CalendarIcon,
  Car,
  Clock,
  DollarSign,
  MapPin,
  User,
  Users,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock4,
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import { format } from "date-fns";

const BookingsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/user/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      setBookings(data);
      setFilteredBookings(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter((booking) => booking.status === statusFilter)
      );
    }
  }, [statusFilter, bookings]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock4 className="h-4 w-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to cancel booking");

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to cancel booking. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-32"></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <Card
                key={booking._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-grow space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="text-lg font-semibold flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-primary" />
                          {booking.ride.from.city} → {booking.ride.to.city}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                          {format(new Date(booking.ride.departureTime), "PPP")}
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {format(new Date(booking.ride.departureTime), "p")}
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          {booking.seats}{" "}
                          {booking.seats === 1 ? "seat" : "seats"}
                        </div>
                        <div className="flex items-center text-sm">
                          <Car className="h-4 w-4 mr-2 text-gray-500" />
                          {booking.ride.vehicle.model}
                        </div>
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {booking.ride.driver.name}
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="h-4 w-4 mr-2 text-gray-500 text-lg">
                            ₹
                          </span>
                          {booking.price}
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Special Requests:</p>
                          <p>{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 items-center md:min-w-32">
                      {booking.status === "pending" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No bookings found.{" "}
                {statusFilter !== "all" && `Try changing the status filter.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default BookingsDashboard;
