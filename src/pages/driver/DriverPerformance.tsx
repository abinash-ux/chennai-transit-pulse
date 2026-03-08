import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Navigation, Users, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export default function DriverPerformance() {
  const { user } = useAuth();
  const [bus, setBus] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: busData } = await supabase
        .from('buses')
        .select('*, routes(distance_km)')
        .eq('driver_id', user.id)
        .maybeSingle();
      if (busData) {
        setBus(busData);
        const { data: tkts } = await supabase
          .from('tickets')
          .select('fare, issued_at')
          .eq('bus_id', busData.id)
          .order('issued_at', { ascending: false });
        if (tkts) setTickets(tkts);
      }
    };
    load();
  }, [user]);

  const totalPassengers = tickets.length;
  const distancePerTrip = (bus as any)?.routes?.distance_km || 18.5;
  // Estimate trips based on tickets (roughly 40 pax per trip)
  const estimatedTrips = Math.max(1, Math.ceil(totalPassengers / 40));
  const totalDistance = Math.round(estimatedTrips * distancePerTrip);
  const avgLoad = bus?.total_seats ? Math.round((bus.current_occupancy / bus.total_seats) * 100) : 0;

  // Group tickets by day for weekly chart
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = dayNames.map((day, i) => {
    const dayTickets = tickets.filter(t => new Date(t.issued_at).getDay() === i);
    return {
      day,
      trips: Math.max(1, Math.ceil(dayTickets.length / 40)),
      distance: Math.round(Math.max(1, Math.ceil(dayTickets.length / 40)) * distancePerTrip),
      passengers: dayTickets.length,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Performance Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Estimated Trips" value={estimatedTrips} icon={Bus} />
        <StatCard title="Distance Covered" value={totalDistance} suffix=" km" icon={Navigation} />
        <StatCard title="Passengers Served" value={totalPassengers} icon={Users} />
        <StatCard title="Current Load" value={avgLoad} suffix="%" icon={Clock} />
      </div>

      <GlassCard>
        <h3 className="font-display text-lg font-bold mb-4">Weekly Performance</h3>
        <div className="space-y-4">
          {weeklyData.map((day, i) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4"
            >
              <span className="w-10 font-semibold text-muted-foreground">{day.day}</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="h-6 rounded bg-primary/60" style={{ width: `${Math.min(100, (day.passengers / Math.max(1, ...weeklyData.map(d => d.passengers))) * 100)}%` }} />
                <span className="text-sm font-medium">{day.trips} trips</span>
              </div>
              <span className="text-sm text-muted-foreground w-20 text-right">{day.distance} km</span>
              <span className="text-sm text-muted-foreground w-24 text-right">{day.passengers} pax</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Avg Passenger Load</h3>
          <div className="text-center py-6">
            <p className="text-5xl font-display font-bold text-primary">{avgLoad}%</p>
            <p className="text-muted-foreground mt-2">Average bus utilization</p>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Bus Status</h3>
          <div className="text-center py-6">
            <p className="text-5xl font-display font-bold text-success">{bus?.bus_number || 'N/A'}</p>
            <p className="text-muted-foreground mt-2">Currently assigned bus</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
