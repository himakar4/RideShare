import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import MainLayout from "../../components/layout/MainLayout";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../hooks/use-toast";

const PaymentPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Select a payment method",
        description: "Please choose a payment option to continue.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Call backend to mark payment as completed for this passenger
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/rides/${rideId}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed.",
      });
      window.location.href = "/dashboard";
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "Could not process payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Payment Options</h1>
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Select Payment Method:
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="credit"
                checked={selectedMethod === "credit"}
                onChange={() => setSelectedMethod("credit")}
              />
              Credit/Debit Card
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={selectedMethod === "upi"}
                onChange={() => setSelectedMethod("upi")}
              />
              UPI
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={selectedMethod === "cash"}
                onChange={() => setSelectedMethod("cash")}
              />
              Cash
            </label>
          </div>
        </div>
        <Button onClick={handlePayment} disabled={loading} className="w-full">
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </MainLayout>
  );
};

export default PaymentPage;
