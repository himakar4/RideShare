import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Car,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import MainLayout from "../../components/layout/MainLayout";
import { API_BASE_URL } from "../../config";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { format } from "date-fns";

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRides();
    fetchBookingRequests();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/driver`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch rides");
      const data = await response.json();
      setRides(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching rides:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your rides. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch booking requests");
      const data = await response.json();
      setBookingRequests(data);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch booking requests. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: action }),
        }
      );

      if (!response.ok) throw new Error(`Failed to ${action} booking`);

      // Refresh booking requests
      fetchBookingRequests();

      toast({
        title: `Booking ${action}ed`,
        description: `You have successfully ${action}ed the booking request.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} booking. Please try again later.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (
      !confirm(
        "Are you sure you want to delete this ride? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (
          response.status === 400 &&
          errorData.message.includes("confirmed bookings")
        ) {
          throw new Error(
            "This ride has confirmed bookings and cannot be deleted. Please contact the passengers to cancel their bookings first."
          );
        }

        throw new Error(errorData.message || "Failed to delete ride");
      }

      // Refresh rides list
      fetchRides();

      toast({
        title: "Ride deleted",
        description: "Your ride has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting ride:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete ride. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Function to count the number of pending requests for a specific ride
  const getPendingRequestsCount = (rideId) => {
    return bookingRequests.filter((request) => request.ride._id === rideId)
      .length;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardContent className="p-6 h-96"></CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>

        <Tabs defaultValue="rides" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rides">My Rides</TabsTrigger>
            <TabsTrigger value="requests">
              Booking Requests{" "}
              {bookingRequests.length > 0 && `(${bookingRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rides" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">My Offered Rides</h2>
            </div>
            {rides.length > 0 ? (
              rides.map((ride) => (
                <Card
                  key={ride._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-primary" />
                            {ride.from.city} → {ride.to.city}
                            {getPendingRequestsCount(ride._id) > 0 && (
                              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {getPendingRequestsCount(ride._id)} pending
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-500 mt-1">
                            {ride.from.address} → {ride.to.address}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                            {new Date(ride.departureTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            {new Date(ride.departureTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            {ride.availableSeats} seats available
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="h-4 w-4 mr-2 text-gray-500 text-lg">
                              ₹
                            </span>
                            {ride.pricePerSeat} per seat
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/ride/${ride._id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteRide(ride._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Ride
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  You haven't created any rides yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Booking Requests</h2>
            {bookingRequests.length > 0 ? (
              bookingRequests.map((request) => (
                <Card
                  key={request._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Request from {request.passenger.name}
                          </h3>
                          <p className="text-gray-500">
                            For ride: {request.ride.from.city} →{" "}
                            {request.ride.to.city}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                            {format(
                              new Date(request.ride.departureTime),
                              "PPP"
                            )}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            {format(new Date(request.ride.departureTime), "p")}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            {request.seats}{" "}
                            {request.seats === 1 ? "seat" : "seats"}
                          </div>
                          <div className="flex items-center">
                            <span className="h-4 w-4 mr-2 text-gray-500 text-lg">
                              ₹
                            </span>
                            {request.price}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            Pickup: {request.pickupLocation}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            Dropoff: {request.dropoffLocation}
                          </div>
                        </div>
                        {request.specialRequests && (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Special Requests:</p>
                            <p>{request.specialRequests}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleBookingAction(request._id, "accepted")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleBookingAction(request._id, "rejected")
                          }
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No booking requests at the moment.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DriverDashboard;
