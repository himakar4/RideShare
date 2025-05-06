import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Car,
  Clock,
  MapPin,
  DollarSign,
  Users,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import MainLayout from "../../components/layout/MainLayout";
import { useUserContext } from "../../context/UserContext";
import { API_BASE_URL } from "../../config";
import axios from "axios";

const OfferRide = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      departure: "",
      destination: "",
      date: new Date(),
      time: "09:00",
      availableSeats: 3,
      price: 20,
      carModel: "",
      carColor: "",
      licensePlate: "",
      description: "",
    },
  });
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token || !user || !user._id) {
        toast({
          title: "Authentication Error",
          description:
            "User not found or not logged in properly. Please log in again.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Format date and time for API
      const departureDateTime = new Date(date);
      const [hours, minutes] = data.time.split(":");
      departureDateTime.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10),
        0,
        0
      );

      // Prepare ride data
      const rideData = {
        from: {
          city: data.departure,
          address: `${data.departure}, Placeholder Address`,
          coordinates: { lat: 0, lng: 0 }, // This would be replaced with actual coordinates
        },
        to: {
          city: data.destination,
          address: `${data.destination}, Placeholder Address`,
          coordinates: { lat: 0, lng: 0 }, // This would be replaced with actual coordinates
        },
        driver: user._id,
        departureTime: departureDateTime.toISOString(),
        availableSeats: parseInt(data.availableSeats, 10),
        pricePerSeat: parseFloat(data.price),
        vehicle: {
          model: data.carModel,
          color: data.carColor,
          licensePlate: data.licensePlate,
        },
        description: data.description,
        status: "scheduled",
      };

      // Make API call to create ride
      const response = await axios.post(`${API_BASE_URL}/rides`, rideData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Ride offered successfully",
        description:
          "Your ride has been posted and is now available for booking.",
      });

      // Navigate to the ride details page
      navigate(`/ride/${response.data._id}`);
    } catch (error) {
      console.error("Error offering ride:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to offer ride. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Offer a Ride</CardTitle>
              <CardDescription>
                Share your journey and help others travel while earning some
                money.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure">Departure City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="departure"
                        className="pl-10"
                        placeholder="Enter departure city"
                        {...register("departure", {
                          required: "Departure city is required",
                        })}
                      />
                    </div>
                    {errors.departure && (
                      <p className="text-sm text-red-500">
                        {errors.departure.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="destination"
                        className="pl-10"
                        placeholder="Enter destination city"
                        {...register("destination", {
                          required: "Destination city is required",
                        })}
                      />
                    </div>
                    {errors.destination && (
                      <p className="text-sm text-red-500">
                        {errors.destination.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            setValue("date", newDate);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="time"
                        type="time"
                        className="pl-10"
                        {...register("time", { required: "Time is required" })}
                      />
                    </div>
                    {errors.time && (
                      <p className="text-sm text-red-500">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableSeats">Available Seats</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="availableSeats"
                        type="number"
                        min="1"
                        max="8"
                        className="pl-10"
                        {...register("availableSeats", {
                          required: "Number of seats is required",
                          min: {
                            value: 1,
                            message: "At least 1 seat is required",
                          },
                          max: { value: 8, message: "Maximum 8 seats allowed" },
                        })}
                      />
                    </div>
                    {errors.availableSeats && (
                      <p className="text-sm text-red-500">
                        {errors.availableSeats.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Seat (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 h-4 w-4 text-gray-500 text-lg">
                        ₹
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="1"
                        step="0.01"
                        className="pl-10"
                        {...register("price", {
                          required: "Price is required",
                          min: {
                            value: 1,
                            message: "Price must be at least ₹1",
                          },
                        })}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carModel">Car Model</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="carModel"
                      className="pl-10"
                      placeholder="e.g., Toyota Camry"
                      {...register("carModel", {
                        required: "Car model is required",
                      })}
                    />
                  </div>
                  {errors.carModel && (
                    <p className="text-sm text-red-500">
                      {errors.carModel.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carColor">Car Color</Label>
                    <Input
                      id="carColor"
                      placeholder="e.g., Red"
                      {...register("carColor", {
                        required: "Car color is required",
                      })}
                    />
                    {errors.carColor && (
                      <p className="text-sm text-red-500">
                        {errors.carColor.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      placeholder="e.g., ABC123"
                      {...register("licensePlate", {
                        required: "License plate is required",
                      })}
                    />
                    {errors.licensePlate && (
                      <p className="text-sm text-red-500">
                        {errors.licensePlate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Information</Label>
                  <Input
                    id="description"
                    placeholder="Any additional information about your ride"
                    {...register("description")}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Offering Ride..." : "Offer Ride"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default OfferRide;
