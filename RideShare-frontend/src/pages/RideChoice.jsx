import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardTitle } from "../components/ui/card";

const RideChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 text-center space-y-6">
        <CardTitle className="text-xl font-semibold">
          What would you like to do?
        </CardTitle>
        <CardContent className="space-y-4">
          <Button onClick={() => navigate("/find-rides")} className="w-full">
            Find Rides
          </Button>
          <Button
            onClick={() => navigate("/offer-ride")}
            variant="secondary"
            className="w-full"
          >
            Offer a Ride
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideChoice; 