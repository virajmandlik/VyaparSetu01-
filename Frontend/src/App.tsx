import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SellerOnboarding from "./pages/auth/SellerOnboarding";

// Seller Pages
import SellerDashboard from "./pages/seller/SellerDashboard";
import InventoryManagement from "./pages/seller/InventoryManagement";
import ForecastingPage from "./pages/seller/ForecastingPage";
import SellerPartnershipRequests from "./pages/seller/PartnershipRequests";
import SellerProductRequests from "./pages/seller/ProductRequests";
import SellerMessages from "./pages/seller/Messages";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import FindSellers from "./pages/buyer/FindSellers";
import Partnerships from "./pages/buyer/Partnerships";
import RequestProducts from "./pages/buyer/RequestProducts";
import BuyerProductRequests from "./pages/buyer/ProductRequests";
import BuyerMessages from "./pages/buyer/Messages";
import Inventory from "./pages/buyer/Inventory";
import Sales from "./pages/buyer/Sales";
// import ProductOrdering from "./pages/buyer/ProductOrdering"; // Not used

const queryClient = new QueryClient();

// Protected Route Component
// Registration Completion Check Component
const RegistrationCheck = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user && user.role === 'seller' && !user.registrationComplete) {
    return <Navigate to="/seller-onboarding" />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'buyer' | 'seller' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'buyer' ? '/buyer' : '/seller'} />;
  }

  return <RegistrationCheck>{children}</RegistrationCheck>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'buyer' ? '/buyer' : '/seller'} />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'buyer' ? '/buyer' : '/seller'} />} />
      <Route path="/seller-onboarding" element={
        user ? (
          user.role === 'seller' && !user.registrationComplete ?
            <SellerOnboarding /> :
            <Navigate to={user.role === 'buyer' ? '/buyer' : '/seller'} />
        ) : (
          <Navigate to="/login" />
        )
      } />

      {/* Seller Routes */}
      <Route path="/seller" element={
        <ProtectedRoute allowedRole="seller">
          <SellerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/seller/inventory" element={
        <ProtectedRoute allowedRole="seller">
          <InventoryManagement />
        </ProtectedRoute>
      } />
      <Route path="/seller/orders" element={
        <ProtectedRoute allowedRole="seller">
          <SellerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/seller/forecasting" element={
        <ProtectedRoute allowedRole="seller">
          <ForecastingPage />
        </ProtectedRoute>
      } />
      <Route path="/seller/partnerships" element={
        <ProtectedRoute allowedRole="seller">
          <SellerPartnershipRequests />
        </ProtectedRoute>
      } />
      <Route path="/seller/product-requests" element={
        <ProtectedRoute allowedRole="seller">
          <SellerProductRequests />
        </ProtectedRoute>
      } />
      <Route path="/seller/messages/:partnershipId" element={
        <ProtectedRoute allowedRole="seller">
          <SellerMessages />
        </ProtectedRoute>
      } />
      <Route path="/seller/reports" element={
        <ProtectedRoute allowedRole="seller">
          <SellerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/seller/settings" element={
        <ProtectedRoute allowedRole="seller">
          <SellerDashboard />
        </ProtectedRoute>
      } />

      {/* Buyer Routes */}
      <Route path="/buyer" element={
        <ProtectedRoute allowedRole="buyer">
          <BuyerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/buyer/find-sellers" element={
        <ProtectedRoute allowedRole="buyer">
          <FindSellers />
        </ProtectedRoute>
      } />
      <Route path="/buyer/partnerships" element={
        <ProtectedRoute allowedRole="buyer">
          <Partnerships />
        </ProtectedRoute>
      } />
      <Route path="/buyer/partnerships/:partnershipId" element={
        <ProtectedRoute allowedRole="buyer">
          <Partnerships />
        </ProtectedRoute>
      } />
      <Route path="/buyer/request-products/:partnershipId" element={
        <ProtectedRoute allowedRole="buyer">
          <RequestProducts />
        </ProtectedRoute>
      } />
      <Route path="/buyer/product-requests" element={
        <ProtectedRoute allowedRole="buyer">
          <BuyerProductRequests />
        </ProtectedRoute>
      } />
      <Route path="/buyer/product-requests/:requestId" element={
        <ProtectedRoute allowedRole="buyer">
          <BuyerProductRequests />
        </ProtectedRoute>
      } />
      <Route path="/buyer/messages/:partnershipId" element={
        <ProtectedRoute allowedRole="buyer">
          <BuyerMessages />
        </ProtectedRoute>
      } />
      <Route path="/buyer/inventory" element={
        <ProtectedRoute allowedRole="buyer">
          <Inventory />
        </ProtectedRoute>
      } />
      <Route path="/buyer/sales" element={
        <ProtectedRoute allowedRole="buyer">
          <Sales />
        </ProtectedRoute>
      } />
      <Route path="/buyer/settings" element={
        <ProtectedRoute allowedRole="buyer">
          <BuyerDashboard />
        </ProtectedRoute>
      } />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>

    <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

          <AppRoutes />

      </TooltipProvider>
    </AuthProvider>
    </BrowserRouter>

  </QueryClientProvider>
);

export default App;
