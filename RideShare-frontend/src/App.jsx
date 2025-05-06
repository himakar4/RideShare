import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import OfferRide from "./pages/rides/OfferRide";
import FindRides from "./pages/rides/FindRides";
import RideDetails from "./pages/rides/RideDetails";
import RideHistory from "./pages/rides/RideHistory";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import RideChoice from "./pages/RideChoice";
import BookingsDashboard from "./pages/dashboard/BookingsDashboard";
import PaymentPage from "./pages/payment/PaymentPage";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }) => {
  // Check if the user is authenticated (in this case, we check if there's a user item in localStorage)
  const isAuthenticated = !!localStorage.getItem("user");

  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/choose-role" element={<RideChoice />} />
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/offer-ride"
                element={
                  <ProtectedRoute>
                    <OfferRide />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/find-rides"
                element={
                  <ProtectedRoute>
                    <FindRides />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ride/:id"
                element={
                  <ProtectedRoute>
                    <RideDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ride-history"
                element={
                  <ProtectedRoute>
                    <RideHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:rideId"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </QueryClientProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
