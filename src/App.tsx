import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardRouter from "./pages/DashboardRouter";
import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import TrackBus from "./pages/passenger/TrackBus";
import PassengerTickets from "./pages/passenger/PassengerTickets";
import PassengerWallet from "./pages/passenger/PassengerWallet";
import DriverDashboard from "./pages/driver/DriverDashboard";
import ConductorDashboard from "./pages/conductor/ConductorDashboard";
import InspectorDashboard from "./pages/inspector/InspectorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardRouter />} />
                <Route path="passenger" element={<PassengerDashboard />} />
                <Route path="passenger/track" element={<TrackBus />} />
                <Route path="passenger/tickets" element={<PassengerTickets />} />
                <Route path="passenger/wallet" element={<PassengerWallet />} />
                <Route path="passenger/*" element={<PassengerDashboard />} />
                <Route path="driver" element={<DriverDashboard />} />
                <Route path="driver/*" element={<DriverDashboard />} />
                <Route path="conductor" element={<ConductorDashboard />} />
                <Route path="conductor/*" element={<ConductorDashboard />} />
                <Route path="inspector" element={<InspectorDashboard />} />
                <Route path="inspector/*" element={<InspectorDashboard />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/*" element={<AdminDashboard />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
