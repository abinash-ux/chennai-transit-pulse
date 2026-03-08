-- ================================================
-- SMART CHENNAI AI PUBLIC TRANSPORT MANAGEMENT SYSTEM
-- Complete Database Schema
-- ================================================

-- ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('passenger', 'driver', 'conductor', 'inspector', 'admin');
CREATE TYPE public.ticket_status AS ENUM ('active', 'used', 'expired', 'cancelled');
CREATE TYPE public.complaint_status AS ENUM ('pending', 'under_review', 'resolved', 'rejected');
CREATE TYPE public.reroute_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE public.fine_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE public.sos_status AS ENUM ('active', 'acknowledged', 'resolved');
CREATE TYPE public.sos_type AS ENUM ('mechanical', 'accident', 'security', 'medical', 'other');
CREATE TYPE public.complaint_type AS ENUM ('bus_didnt_stop', 'rude_conductor', 'rude_driver', 'cleanliness', 'overcrowding', 'other');

-- ================================================
-- PROFILES TABLE (User Management)
-- ================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- USER ROLES TABLE (Role Management)
-- ================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ================================================
-- ROUTES TABLE
-- ================================================
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_number TEXT NOT NULL UNIQUE,
  route_name TEXT NOT NULL,
  start_stop TEXT NOT NULL,
  end_stop TEXT NOT NULL,
  stops JSONB NOT NULL DEFAULT '[]',
  distance_km DECIMAL(10,2),
  estimated_time_mins INTEGER,
  base_fare DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  fare_per_km DECIMAL(10,2) NOT NULL DEFAULT 1.50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- BUSES TABLE
-- ================================================
CREATE TABLE public.buses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_number TEXT NOT NULL UNIQUE,
  route_id UUID REFERENCES public.routes(id),
  driver_id UUID REFERENCES auth.users(id),
  conductor_id UUID REFERENCES auth.users(id),
  total_seats INTEGER NOT NULL DEFAULT 40,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  current_latitude DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  last_stop TEXT,
  next_stop TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- STOPS TABLE
-- ================================================
CREATE TABLE public.stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stop_name TEXT NOT NULL,
  stop_code TEXT UNIQUE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  zone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- WALLETS TABLE
-- ================================================
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- WALLET TRANSACTIONS TABLE
-- ================================================
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- TICKETS TABLE
-- ================================================
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_code TEXT NOT NULL UNIQUE,
  passenger_id UUID REFERENCES auth.users(id) NOT NULL,
  bus_id UUID REFERENCES public.buses(id),
  route_id UUID REFERENCES public.routes(id),
  from_stop TEXT NOT NULL,
  to_stop TEXT NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('wallet', 'cash', 'pass')),
  status ticket_status NOT NULL DEFAULT 'active',
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  qr_data TEXT
);

-- ================================================
-- MONTHLY PASSES TABLE
-- ================================================
CREATE TABLE public.monthly_passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pass_code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.routes(id),
  pass_type TEXT NOT NULL CHECK (pass_type IN ('single_route', 'all_routes')),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- REROUTE REQUESTS TABLE
-- ================================================
CREATE TABLE public.reroute_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  bus_id UUID REFERENCES public.buses(id),
  bus_number TEXT NOT NULL,
  route_id UUID REFERENCES public.routes(id),
  description TEXT NOT NULL,
  proof_image_url TEXT,
  status reroute_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- COMPLAINTS TABLE
-- ================================================
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_by UUID REFERENCES auth.users(id) NOT NULL,
  complaint_type complaint_type NOT NULL,
  bus_id UUID REFERENCES public.buses(id),
  bus_number TEXT,
  description TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- FINES TABLE
-- ================================================
CREATE TABLE public.fines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id UUID REFERENCES auth.users(id) NOT NULL,
  issued_by UUID REFERENCES auth.users(id) NOT NULL,
  violation_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status fine_status NOT NULL DEFAULT 'pending',
  deadline DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- SOS ALERTS TABLE
-- ================================================
CREATE TABLE public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_by UUID REFERENCES auth.users(id) NOT NULL,
  reporter_role app_role NOT NULL,
  bus_id UUID REFERENCES public.buses(id),
  sos_type sos_type NOT NULL,
  description TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status sos_status NOT NULL DEFAULT 'active',
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- NOTIFICATIONS TABLE
-- ================================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'alert')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- BUS LOCATION HISTORY TABLE
-- ================================================
CREATE TABLE public.bus_location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- REVENUE RECORDS TABLE
-- ================================================
CREATE TABLE public.revenue_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES public.buses(id),
  conductor_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  cash_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  digital_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  pass_count INTEGER NOT NULL DEFAULT 0,
  ticket_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- AI ROUTING SUGGESTIONS TABLE
-- ================================================
CREATE TABLE public.ai_routing_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('add_bus', 'reroute', 'combine_routes')),
  route_id UUID REFERENCES public.routes(id),
  affected_buses UUID[],
  reason TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_implemented BOOLEAN NOT NULL DEFAULT false,
  implemented_by UUID REFERENCES auth.users(id),
  implemented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reroute_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_routing_suggestions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKING
-- ================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- ================================================
-- RLS POLICIES - PROFILES
-- ================================================
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES - USER ROLES
-- ================================================
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - ROUTES (Public read, Admin write)
-- ================================================
CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Admins can manage routes" ON public.routes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - BUSES
-- ================================================
CREATE POLICY "Anyone can view buses" ON public.buses FOR SELECT USING (true);
CREATE POLICY "Admins can manage buses" ON public.buses FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can update assigned bus" ON public.buses FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "Conductors can update assigned bus" ON public.buses FOR UPDATE USING (auth.uid() = conductor_id);

-- ================================================
-- RLS POLICIES - STOPS
-- ================================================
CREATE POLICY "Anyone can view stops" ON public.stops FOR SELECT USING (true);
CREATE POLICY "Admins can manage stops" ON public.stops FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - WALLETS
-- ================================================
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wallet" ON public.wallets FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES - WALLET TRANSACTIONS
-- ================================================
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT 
  USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));
CREATE POLICY "System can insert transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (true);

-- ================================================
-- RLS POLICIES - TICKETS
-- ================================================
CREATE POLICY "Passengers can view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = passenger_id);
CREATE POLICY "Conductors can view/manage tickets" ON public.tickets FOR ALL USING (public.has_role(auth.uid(), 'conductor'));
CREATE POLICY "Inspectors can view tickets" ON public.tickets FOR SELECT USING (public.has_role(auth.uid(), 'inspector'));
CREATE POLICY "Admins can view all tickets" ON public.tickets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - MONTHLY PASSES
-- ================================================
CREATE POLICY "Users can view own passes" ON public.monthly_passes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own passes" ON public.monthly_passes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Conductors can validate passes" ON public.monthly_passes FOR SELECT USING (public.has_role(auth.uid(), 'conductor'));
CREATE POLICY "Inspectors can validate passes" ON public.monthly_passes FOR SELECT USING (public.has_role(auth.uid(), 'inspector'));

-- ================================================
-- RLS POLICIES - REROUTE REQUESTS
-- ================================================
CREATE POLICY "Users can view own reroute requests" ON public.reroute_requests FOR SELECT USING (auth.uid() = requested_by);
CREATE POLICY "Users can create reroute requests" ON public.reroute_requests FOR INSERT WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Admins can manage reroute requests" ON public.reroute_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - COMPLAINTS
-- ================================================
CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins can manage complaints" ON public.complaints FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - FINES
-- ================================================
CREATE POLICY "Passengers can view own fines" ON public.fines FOR SELECT USING (auth.uid() = passenger_id);
CREATE POLICY "Passengers can pay own fines" ON public.fines FOR UPDATE USING (auth.uid() = passenger_id);
CREATE POLICY "Inspectors can issue fines" ON public.fines FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'inspector'));
CREATE POLICY "Inspectors can view issued fines" ON public.fines FOR SELECT USING (public.has_role(auth.uid(), 'inspector'));
CREATE POLICY "Admins can manage fines" ON public.fines FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - SOS ALERTS
-- ================================================
CREATE POLICY "Users can view own SOS alerts" ON public.sos_alerts FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Anyone can create SOS alerts" ON public.sos_alerts FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins can manage SOS alerts" ON public.sos_alerts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - NOTIFICATIONS
-- ================================================
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- ================================================
-- RLS POLICIES - BUS LOCATION HISTORY
-- ================================================
CREATE POLICY "Anyone can view bus locations" ON public.bus_location_history FOR SELECT USING (true);
CREATE POLICY "Drivers can insert bus locations" ON public.bus_location_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'driver'));

-- ================================================
-- RLS POLICIES - REVENUE RECORDS
-- ================================================
CREATE POLICY "Conductors can view own revenue" ON public.revenue_records FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Conductors can create revenue records" ON public.revenue_records FOR INSERT WITH CHECK (auth.uid() = conductor_id);
CREATE POLICY "Admins can view all revenue" ON public.revenue_records FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- RLS POLICIES - AI ROUTING SUGGESTIONS
-- ================================================
CREATE POLICY "Admins can manage AI suggestions" ON public.ai_routing_suggestions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON public.buses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- AUTO-CREATE PROFILE AND WALLET ON SIGNUP
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), NEW.email);
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  -- Default role is passenger
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'passenger');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_buses_route_id ON public.buses(route_id);
CREATE INDEX idx_buses_driver_id ON public.buses(driver_id);
CREATE INDEX idx_buses_conductor_id ON public.buses(conductor_id);
CREATE INDEX idx_tickets_passenger_id ON public.tickets(passenger_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_fines_status ON public.fines(status);
CREATE INDEX idx_sos_alerts_status ON public.sos_alerts(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_bus_location_history_bus_id ON public.bus_location_history(bus_id);