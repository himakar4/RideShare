import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Car,
  Clock,
  MapPin,
  Search,
  User,
  Users,
  Star,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import { useToast } from "../../hooks/use-toast";
import MainLayout from "../../components/layout/MainLayout";
import { API_BASE_URL } from "../../config";
import { useUserContext } from "../../context/UserContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";

const FindRides = () => {
  const { user } = useUserContext();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    seats: 1,
    pickupAddress: "",
    dropoffAddress: "",
    specialRequests: "",
  });

  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: null,
    maxPrice: 100,
    minSeats: 1,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRides();
    fetchVehicles();
  }, []);

  const fetchRides = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchParams.from) queryParams.append("from", searchParams.from);
      if (searchParams.to) queryParams.append("to", searchParams.to);
      if (searchParams.date)
        queryParams.append("date", format(searchParams.date, "yyyy-MM-dd"));
      if (searchParams.minSeats)
        queryParams.append("seats", searchParams.minSeats);

      const response = await fetch(
        `${API_BASE_URL}/rides?${queryParams.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch rides");

      const data = await response.json();

      // Filter out rides offered by the current user
      const filteredData = user
        ? data.filter((ride) => ride.driver && ride.driver._id !== user._id)
        : data;

      setRides(filteredData);
      setFilteredRides(filteredData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching rides:", error);
      toast({
        title: "Error",
        description: "Failed to fetch rides. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles`);
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
      toast({
        title: "Error",
        description: "Failed to fetch vehicles. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    fetchRides();
  };

  const handleBooking = (ride) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book a ride.",
        variant: "destructive",
      });
      return;
    }
    setSelectedRide(ride);
    setIsBookingDialogOpen(true);
  };

  const handleBookingSubmit = async () => {
    try {
      if (!selectedRide || !user) {
        toast({
          title: "Error",
          description: "Please select a ride and ensure you are logged in.",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!bookingForm.pickupAddress || !bookingForm.dropoffAddress) {
        toast({
          title: "Validation Error",
          description: "Please provide both pickup and dropoff addresses.",
          variant: "destructive",
        });
        return;
      }

      if (!bookingForm.seats || bookingForm.seats < 1) {
        toast({
          title: "Validation Error",
          description: "Please select at least one seat.",
          variant: "destructive",
        });
        return;
      }

      const bookingData = {
        ride: selectedRide._id,
        seats: parseInt(bookingForm.seats),
        pickupLocation: bookingForm.pickupAddress.trim(), // Now just a string, not an object
        dropoffLocation: bookingForm.dropoffAddress.trim(), // Now just a string, not an object
        price:
          parseFloat(bookingForm.seats) * parseFloat(selectedRide.pricePerSeat),
        specialRequests: bookingForm.specialRequests?.trim() || undefined,
        status: "pending",
      };

      // Debugging: Log the booking data
      console.log("Booking Data:", bookingData);

      // Ensure all required fields are populated
      if (
        !bookingData.ride ||
        !bookingData.seats ||
        !bookingData.pickupLocation ||
        !bookingData.dropoffLocation ||
        !bookingData.price
      ) {
        toast({
          title: "Validation Error",
          description: "All required fields must be filled out.",
          variant: "destructive",
        });
        return;
      }

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
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const bookingResponse = await response.json();
      console.log("Booking successful:", bookingResponse);

      toast({
        title: "Booking successful",
        description: "Your ride has been booked successfully!",
      });

      setIsBookingDialogOpen(false);
      setBookingForm({
        seats: 1,
        pickupAddress: "",
        dropoffAddress: "",
        specialRequests: "",
      });
      fetchRides(); // Refresh rides after booking
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Find a Ride</h1>
        <p className="text-gray-600 mb-8">
          Search for available rides and connect with drivers heading your way.
        </p>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> From
                </Label>
                <Input
                  id="from"
                  placeholder="e.g., San Francisco"
                  value={searchParams.from}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, from: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> To
                </Label>
                <Input
                  id="to"
                  placeholder="e.g., Los Angeles"
                  value={searchParams.to}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, to: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" /> Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !searchParams.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.date ? (
                        format(searchParams.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchParams.date}
                      onSelect={(date) =>
                        setSearchParams({ ...searchParams, date })
                      }
                      initialFocus
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Button className="w-full h-full mt-8" onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Rides
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-3">
                <Label className="flex items-center">
                  <span className="h-4 w-4 mr-1 text-muted-foreground text-lg">
                    ₹
                  </span>
                  Max Price: ₹{searchParams.maxPrice}
                </Label>
                <Slider
                  value={[searchParams.maxPrice]}
                  min={5}
                  max={100}
                  step={5}
                  onValueChange={(value) =>
                    setSearchParams({ ...searchParams, maxPrice: value[0] })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center">
                  <span className="h-4 w-4 mr-1 text-muted-foreground text-lg">
                    ₹
                  </span>
                  Minimum Seats: {searchParams.minSeats}
                </Label>
                <Slider
                  value={[searchParams.minSeats]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(value) =>
                    setSearchParams({ ...searchParams, minSeats: value[0] })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rides List */}
        <h2 className="text-2xl font-semibold mb-4">Available Rides</h2>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-32"></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRides.length > 0 ? (
          <div className="grid gap-4">
            {filteredRides.map((ride) => (
              <Card
                key={ride._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-grow space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="text-lg font-semibold flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-primary" />
                          {ride.from.city} → {ride.to.city}
                        </div>
                        <div className="flex items-center text-lg font-bold text-primary">
                          <span className="h-4 w-4 mr-1 text-muted-foreground text-lg">
                            ₹
                          </span>
                          {ride.pricePerSeat}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                          {ride.availableSeats} seats
                        </div>
                        <div className="flex items-center text-sm">
                          <Car className="h-4 w-4 mr-2 text-gray-500" />
                          {ride.vehicle?.model} ({ride.vehicle?.color})
                        </div>
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {ride.driver?.name}
                        </div>
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          {ride.driver?.rating || "New"} (
                          {ride.driver?.rides || 0} rides)
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 items-center md:min-w-32">
                      <Button onClick={() => handleBooking(ride)}>
                        Book Seat
                      </Button>
                      <Link to={`/ride/${ride._id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
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
                No rides found. Try adjusting your search parameters.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Booking Dialog */}
        <Dialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
        >
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
                  value={bookingForm.pickupAddress}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      pickupAddress: e.target.value,
                    })
                  }
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
                  value={bookingForm.dropoffAddress}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      dropoffAddress: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Seats
                </label>
                <select
                  className="w-full border p-2 rounded"
                  value={bookingForm.seats}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      seats: Number(e.target.value),
                    })
                  }
                >
                  {[...Array(selectedRide?.availableSeats || 0)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? "seat" : "seats"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Special Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Any special requirements?"
                  className="w-full border p-2 rounded"
                  value={bookingForm.specialRequests}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      specialRequests: e.target.value,
                    })
                  }
                />
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Price per seat:</span>
                    <span>₹{selectedRide?.pricePerSeat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of seats:</span>
                    <span>{bookingForm.seats}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                    <span>Total price:</span>
                    <span>
                      ₹{bookingForm.seats * (selectedRide?.pricePerSeat || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBookingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBookingSubmit}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default FindRides;
