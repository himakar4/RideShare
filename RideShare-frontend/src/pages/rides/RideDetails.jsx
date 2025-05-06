import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Car,
  Clock,
  MapPin,
  MessageCircle,
  User,
  Users,
  Star,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import MainLayout from "../../components/layout/MainLayout";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const bookingFormSchema = z.object({
  seats: z.string().transform((val) => parseInt(val, 10)),
  pickupLocation: z.object({
    address: z.string().min(1, "Pickup address is required"),
    // Remove coordinates if not used
  }),
  dropoffLocation: z.object({
    address: z.string().min(1, "Dropoff address is required"),
    // Remove coordinates if not used
  }),
  price: z.number().min(0, "Price must be a positive number"),
  specialRequests: z.string().optional(),
});

const RideDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Booking form state
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [seats, setSeats] = useState(1);

  const form = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      seats: "1",
      pickupLocation: {
        address: "",
        coordinates: { lat: 0, lng: 0 },
      },
      dropoffLocation: {
        address: "",
        coordinates: { lat: 0, lng: 0 },
      },
      price: 0,
      specialRequests: "",
      paymentStatus: "pending",
      status: "pending",
    },
  });

  const [driverStats, setDriverStats] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);

  useEffect(() => {
    fetchRideDetails();
  }, [id]);

  useEffect(() => {
    if (ride) {
      setPickupAddress(ride.from.address || "");
      setDropoffAddress(ride.to.address || "");
      form.setValue("pickupLocation", {
        address: ride.from.address || "",
        coordinates: ride.from.coordinates || { lat: 0, lng: 0 },
      });
      form.setValue("dropoffLocation", {
        address: ride.to.address || "",
        coordinates: ride.to.coordinates || { lat: 0, lng: 0 },
      });
      form.setValue("price", ride.pricePerSeat || 0);
    }
  }, [ride, form]);

  useEffect(() => {
    if (ride && ride.driver && ride.driver._id) {
      fetchDriverStats(ride.driver._id);
      fetchDriverProfile(ride.driver._id);
    }
  }, [ride]);

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${id}`);
      if (!response.ok) throw new Error("Failed to fetch ride details");
      const data = await response.json();
      setRide(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching ride details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ride details. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchDriverStats = async (driverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${driverId}/stats`);
      if (!response.ok) throw new Error("Failed to fetch driver stats");
      const data = await response.json();
      setDriverStats(data);
    } catch (error) {
      console.error("Error fetching driver stats:", error);
    }
  };

  const fetchDriverProfile = async (driverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${driverId}`);
      if (!response.ok) throw new Error("Failed to fetch driver profile");
      const data = await response.json();
      setDriverProfile(data);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book a ride.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (user.role !== "passenger") {
        toast({
          title: "Invalid role",
          description: "Only passengers can book rides.",
          variant: "destructive",
        });
        return;
      }

      if (!pickupAddress || !dropoffAddress) {
        toast({
          title: "Validation Error",
          description: "Please provide both pickup and dropoff addresses.",
          variant: "destructive",
        });
        return;
      }

      // Calculate total price
      const totalPrice = seats * ride.pricePerSeat;

      // Prepare the booking data according to the backend schema
      const bookingData = {
        ride: id, // The ride ID from the URL params
        passenger: user._id, // The current user's ID
        seats: seats,
        status: "pending",
        pickupLocation: {
          address: pickupAddress.trim(),
          coordinates: ride.from.coordinates || { lat: 0, lng: 0 },
        },
        dropoffLocation: {
          address: dropoffAddress.trim(),
          coordinates: ride.to.coordinates || { lat: 0, lng: 0 },
        },
        price: totalPrice,
        paymentStatus: "pending",
      };

      // Log the booking data for debugging
      console.log("Submitting booking data:", bookingData);

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Booking error response:", errorData);
        throw new Error(errorData.message || "Failed to book ride");
      }

      const booking = await response.json();
      console.log("Booking successful:", booking);

      setShowBookingDialog(false);
      setPickupAddress("");
      setDropoffAddress("");
      setSeats(1);

      toast({
        title: "Booking request sent",
        description:
          "The driver will be notified of your request. You can view your booking in your dashboard.",
      });

      navigate("/dashboard/bookings");
    } catch (error) {
      console.error("Error booking ride:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to book ride. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      // 1. Find or create the chat
      const chatResponse = await fetch(`${API_BASE_URL}/chats/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          participantId: ride.driver._id,
          rideId: ride._id,
        }),
      });
      if (!chatResponse.ok) throw new Error("Failed to create/find chat");
      const chat = await chatResponse.json();
      const chatId = chat._id;

      // 2. Send the message
      const messageResponse = await fetch(
        `${API_BASE_URL}/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: message }),
        }
      );
      if (!messageResponse.ok) throw new Error("Failed to send message");

      setMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent to the driver.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    }
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

  if (!ride) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Ride not found.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Ride Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  {ride.from.city} → {ride.to.city}
                </h1>
                <p className="text-gray-500 mt-2">
                  {ride.from.address} → {ride.to.address}
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">
                <span className="h-4 w-4 mr-1 text-muted-foreground text-lg">
                  ₹
                </span>
                {ride.pricePerSeat}
                <span className="text-sm text-gray-500 block text-right">
                  per seat
                </span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ride Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(ride.departureTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(ride.departureTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      {ride.availableSeats} seats available
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Car className="h-4 w-4 mr-2 text-gray-500" />
                      {ride.vehicle.model} ({ride.vehicle.color})
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      {driverStats
                        ? driverStats.rating
                          ? driverStats.rating.toFixed(1)
                          : "New"
                        : ride.driver.rating || "New"}
                      (
                      {driverStats
                        ? driverStats.totalRides || 0
                        : ride.driver.rides || 0}{" "}
                      rides)
                    </div>
                  </div>
                </div>

                {ride.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-gray-600">{ride.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Message the Driver
                </h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow"
                  />
                  <Button onClick={handleSendMessage}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Booking</h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {ride?.availableSeats} seats available
                  </p>
                  <div className="flex justify-between items-center">
                    <span>Price per seat</span>
                    <span className="font-semibold">
                      <span className="h-4 w-4 mr-1 text-muted-foreground text-lg">
                        ₹
                      </span>
                      {ride?.pricePerSeat}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setShowBookingDialog(true)}
                    disabled={!user || user.role !== "passenger"}
                  >
                    Book Seat
                  </Button>
                  <div className="text-sm text-gray-500 space-y-2">
                    <p>
                      • You will not be charged until the driver accepts your
                      request.
                    </p>
                    <p>• Free cancellation up to 24 hours before departure.</p>
                    <p>• All payments are secure and protected.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About the Driver</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    {ride.driver.profilePicture && (
                      <img
                        src={ride.driver.profilePicture}
                        alt={ride.driver.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{ride.driver.name}</h3>
                    <p className="text-sm text-gray-500">
                      Member since{" "}
                      {driverProfile && driverProfile.createdAt
                        ? new Date(driverProfile.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1">
                        {driverStats
                          ? driverStats.rating
                            ? driverStats.rating.toFixed(1)
                            : "New"
                          : ride.driver.rating || "New"}{" "}
                        (
                        {driverStats
                          ? driverStats.totalRides || 0
                          : ride.driver.rides || 0}{" "}
                        rides)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Please fill in the details for your booking request.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pickup Address
                </label>
                <input
                  type="text"
                  placeholder="Enter pickup address"
                  className="w-full border p-2 rounded"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Dropoff Address
                </label>
                <input
                  type="text"
                  placeholder="Enter dropoff address"
                  className="w-full border p-2 rounded"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Seats
                </label>
                <select
                  className="w-full border p-2 rounded"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                >
                  {[...Array(ride?.availableSeats || 0)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? "seat" : "seats"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Price per seat:</span>
                    <span>
                      <span className="h-4 w-4 mr-1 text-muted-foreground text-lg">
                        ₹
                      </span>
                      {ride?.pricePerSeat}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of seats:</span>
                    <span>{seats}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                    <span>Total price:</span>
                    <span>
                      <span className="h-4 w-4 mr-1 text-muted-foreground text-lg">
                        ₹
                      </span>
                      {seats * (ride?.pricePerSeat || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBookingDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBooking}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default RideDetails;
