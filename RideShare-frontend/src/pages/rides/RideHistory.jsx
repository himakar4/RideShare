import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useUserContext } from "../../context/UserContext";
import { Car, Calendar, Clock, MapPin, Users } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { API_BASE_URL } from "../../config";

const RideHistory = () => {
  const { user } = useUserContext();
  const [completedRides, setCompletedRides] = useState([]);
  const [canceledRides, setCanceledRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/rides/user/rides`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const allRides = await res.json();
        // Filter and map rides for display
        setCompletedRides(
          allRides
            .filter((ride) => ride.status === "completed")
            .map((ride) => ({
              id: ride._id,
              from: ride.from?.city || ride.from,
              to: ride.to?.city || ride.to,
              date: ride.departureTime,
              time: new Date(ride.departureTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              price: ride.pricePerSeat,
              status: ride.status,
              role:
                user._id === (ride.driver?._id || ride.driver)
                  ? "driver"
                  : "passenger",
              passengers: ride.passengers?.length,
              otherUser:
                user._id === (ride.driver?._id || ride.driver)
                  ? ride.passengers && ride.passengers[0]?.user
                  : ride.driver,
            }))
        );
        setCanceledRides(
          allRides
            .filter(
              (ride) =>
                ride.status === "cancelled" || ride.status === "canceled"
            )
            .map((ride) => ({
              id: ride._id,
              from: ride.from?.city || ride.from,
              to: ride.to?.city || ride.to,
              date: ride.departureTime,
              time: new Date(ride.departureTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              price: ride.pricePerSeat,
              status: ride.status,
              role:
                user._id === (ride.driver?._id || ride.driver)
                  ? "driver"
                  : "passenger",
              passengers: ride.passengers?.length,
              otherUser:
                user._id === (ride.driver?._id || ride.driver)
                  ? ride.passengers && ride.passengers[0]?.user
                  : ride.driver,
            }))
        );
      } catch (error) {
        console.error("Error fetching ride history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?._id) {
      fetchRides();
    }
  }, [user]);

  const getRideStatusBadge = (status, role, canceledBy) => {
    if (status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Completed
        </Badge>
      );
    }
    if (status === "canceled") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {canceledBy === role ? "You Canceled" : `Canceled by ${canceledBy}`}
        </Badge>
      );
    }
    return null;
  };

  const RideCard = ({ ride }) => (
    <Card key={ride.id}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                {ride.from} → {ride.to}
              </div>
              <div className="md:hidden">
                {getRideStatusBadge(ride.status, ride.role, ride.canceledBy)}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {new Date(ride.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                {ride.time}
              </div>
              {ride.role === "passenger" ? (
                <div className="flex items-center text-sm">
                  <Car className="h-4 w-4 mr-2 text-gray-500" />
                  Driver: {ride.otherUser?.name || "N/A"}
                </div>
              ) : (
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  {ride.passengers || 0} passengers
                </div>
              )}
              <div className="flex items-center text-sm font-medium">
                {ride.status === "canceled"
                  ? `₹${ride.price} (not charged)`
                  : `₹${ride.price} ${
                      ride.role === "rider" ? "earned" : "paid"
                    }`}
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3 items-center">
            <div className="hidden md:block mb-2">
              {getRideStatusBadge(ride.status, ride.role, ride.canceledBy)}
            </div>
            <Link to={`/ride/${ride.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Ride History</h1>
          <p className="text-gray-600 mb-8">
            View your past rides and their details.
          </p>

          <Tabs defaultValue="completed" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="completed">Completed Rides</TabsTrigger>
              <TabsTrigger value="canceled">Canceled Rides</TabsTrigger>
            </TabsList>

            <TabsContent value="completed">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6 h-24" />
                    </Card>
                  ))}
                </div>
              ) : completedRides.length > 0 ? (
                <div className="space-y-4">
                  {completedRides.map((ride) => (
                    <RideCard key={ride.id} ride={ride} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      You have no completed rides yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="canceled">
              {isLoading ? (
                <Card className="animate-pulse">
                  <CardContent className="p-6 h-24" />
                </Card>
              ) : canceledRides.length > 0 ? (
                <div className="space-y-4">
                  {canceledRides.map((ride) => (
                    <RideCard key={ride.id} ride={ride} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      You have no canceled rides.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default RideHistory;
