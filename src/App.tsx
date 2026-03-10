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
import TripPlanner from "./pages/passenger/TripPlanner";
import MonthlyPass from "./pages/passenger/MonthlyPass";
import RerouteRequest from "./pages/passenger/RerouteRequest";
import Complaints from "./pages/passenger/Complaints";
import MyFines from "./pages/passenger/MyFines";
import PassengerSOS from "./pages/passenger/PassengerSOS";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverRoute from "./pages/driver/DriverRoute";
import DriverSOS from "./pages/driver/DriverSOS";
import DriverPerformance from "./pages/driver/DriverPerformance";
import DriverBusRequest from "./pages/driver/DriverBusRequest";
import ConductorDashboard from "./pages/conductor/ConductorDashboard";
import ConductorIssueTicket from "./pages/conductor/ConductorIssueTicket";
import ConductorValidate from "./pages/conductor/ConductorValidate";
import ConductorPassengers from "./pages/conductor/ConductorPassengers";
import ConductorRevenue from "./pages/conductor/ConductorRevenue";
import ConductorSOS from "./pages/conductor/ConductorSOS";
import ConductorComplaints from "./pages/conductor/ConductorComplaints";
import ConductorReroute from "./pages/conductor/ConductorReroute";
import InspectorDashboard from "./pages/inspector/InspectorDashboard";
import InspectorCheckTicket from "./pages/inspector/InspectorCheckTicket";
import InspectorIssueFine from "./pages/inspector/InspectorIssueFine";
import InspectorAnalytics from "./pages/inspector/InspectorAnalytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFleet from "./pages/admin/AdminFleet";
import AdminRouting from "./pages/admin/AdminRouting";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminSOS from "./pages/admin/AdminSOS";
import AdminUsers from "./pages/admin/AdminUsers";
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
                {/* Passenger */}
                <Route path="passenger" element={<PassengerDashboard />} />
                <Route path="passenger/track" element={<TrackBus />} />
                <Route path="passenger/tickets" element={<PassengerTickets />} />
                <Route path="passenger/wallet" element={<PassengerWallet />} />
                <Route path="passenger/planner" element={<TripPlanner />} />
                <Route path="passenger/pass" element={<MonthlyPass />} />
                <Route path="passenger/sos" element={<PassengerSOS />} />
                <Route path="passenger/reroute" element={<RerouteRequest />} />
                <Route path="passenger/complaints" element={<Complaints />} />
                <Route path="passenger/fines" element={<MyFines />} />
                {/* Driver */}
                <Route path="driver" element={<DriverDashboard />} />
                <Route path="driver/route" element={<DriverRoute />} />
                <Route path="driver/sos" element={<DriverSOS />} />
                <Route path="driver/performance" element={<DriverPerformance />} />
                <Route path="driver/requests" element={<DriverBusRequest />} />
                {/* Conductor */}
                <Route path="conductor" element={<ConductorDashboard />} />
                <Route path="conductor/tickets" element={<ConductorIssueTicket />} />
                <Route path="conductor/validate" element={<ConductorValidate />} />
                <Route path="conductor/passengers" element={<ConductorPassengers />} />
                <Route path="conductor/revenue" element={<ConductorRevenue />} />
                <Route path="conductor/sos" element={<ConductorSOS />} />
                <Route path="conductor/complaints" element={<ConductorComplaints />} />
                <Route path="conductor/reroute" element={<ConductorReroute />} />
                {/* Inspector */}
                <Route path="inspector" element={<InspectorDashboard />} />
                <Route path="inspector/check" element={<InspectorCheckTicket />} />
                <Route path="inspector/fines" element={<InspectorIssueFine />} />
                <Route path="inspector/analytics" element={<InspectorAnalytics />} />
                {/* Admin */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/fleet" element={<AdminFleet />} />
                <Route path="admin/routing" element={<AdminRouting />} />
                <Route path="admin/revenue" element={<AdminRevenue />} />
                <Route path="admin/complaints" element={<AdminComplaints />} />
                <Route path="admin/sos" element={<AdminSOS />} />
                <Route path="admin/users" element={<AdminUsers />} />
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
