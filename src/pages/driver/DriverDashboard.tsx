import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, Clock, AlertTriangle, Navigation, Bell } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TOTAL_CAPACITY = 70; // 40 seated + 30 standing
const SEATED_CAPACITY = 40;

export default function DriverDashboard() {
  const { user } = useAuth();
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [todayTickets, setTodayTickets] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: busData } = await supabase
        .from('buses')
        .select('*, routes(*)')
        .eq('driver_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (busData) {
        setBus(busData);
        setRoute((busData as any).routes);

        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('bus_id', busData.id)
          .gte('issued_at', today);
        setTodayTickets(count || 0);
      }

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (notifs) setAlerts(notifs);
    };
    load();
  }, [user]);

  const occupancy = bus?.current_occupancy || 0;
  const seated = Math.min(occupancy, SEATED_CAPACITY);
  const standing = Math.max(0, occupancy - SEATED_CAPACITY);
  const pct = Math.round((occupancy / TOTAL_CAPACITY) * 100);
  const stops = (route?.stops as string[]) || [];
  const currentStopIndex = stops.indexOf(bus?.next_stop || '') !== -1 
    ? stops.indexOf(bus?.next_stop || '') 
    : Math.floor(stops.length / 2);

  const handleReportOvercrowding = async () => {
    if (!user || !bus) return;
    await supabase.from('sos_alerts').insert({
      reported_by: user.id,
      reporter_role: 'driver' as const,
      sos_type: 'other' as const,
      description: `Bus ${bus.bus_number} is overcrowded at ${occupancy}/${TOTAL_CAPACITY} passengers (${pct}% capacity). Seated: ${seated}, Standing: ${standing}.`,
      bus_id: bus.id,
    });
    toast.success('Overcrowding alert sent to Admin!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Bus" value={bus?.bus_number || 'Not Assigned'} icon={Bus} />
        <StatCard title="Passengers" value={occupancy} suffix={`/${TOTAL_CAPACITY}`} icon={Users} />
        <StatCard title="Today's Tickets" value={todayTickets} icon={Navigation} />
        <StatCard title="Occupancy" value={pct} suffix="%" icon={Clock} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard glow className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-bold">Current Assignment</h3>
              <p className="text-muted-foreground">{bus?.bus_number || 'No bus assigned'}</p>
            </div>
            {bus && (
              <Badge className="badge-success text-base px-4 py-1">
                <span className="h-2 w-2 rounded-full bg-success mr-2 pulse-live" />
                Active
              </Badge>
            )}
          </div>

          {route ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-primary">{route.route_number}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{route.route_name}</p>
                    <p className="text-muted-foreground">{route.start_stop} → {route.end_stop}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-semibold">{route.distance_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Time</span>
                    <span className="font-semibold">{route.estimated_time_mins} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seated</span>
                    <span className="font-semibold">{seated}/{SEATED_CAPACITY}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standing</span>
                    <span className="font-semibold">{standing}/{TOTAL_CAPACITY - SEATED_CAPACITY}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Occupancy</span>
                    <span className={`font-semibold ${pct > 85 ? 'text-destructive' : pct > 70 ? 'text-warning' : 'text-success'}`}>
                      {occupancy}/{TOTAL_CAPACITY} ({pct}%)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Capacity Breakdown</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
                    <p className="text-2xl font-bold text-success">{seated}</p>
                    <p className="text-xs text-muted-foreground">Seated</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-center">
                    <p className="text-2xl font-bold text-warning">{standing}</p>
                    <p className="text-xs text-muted-foreground">Standing</p>
                  </div>
                </div>
                <div className="relative h-24 flex items-end justify-center gap-2">
                  {[65, pct, Math.max(20, pct - 8), Math.min(100, pct + 5), Math.min(100, pct + 10), Math.max(20, pct - 2), pct].map((val, i) => (
                    <motion.div
                      key={i}
                      className="w-7 rounded-t-md"
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ delay: i * 0.1 }}
                      style={{ background: val > 85 ? 'hsl(var(--warning))' : 'hsl(var(--primary))' }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>6AM</span><span>8AM</span><span>10AM</span><span>12PM</span><span>2PM</span><span>4PM</span><span>6PM</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No route assigned. Contact Admin.</p>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Route Alerts
            </h3>
            <Badge variant="outline">{alerts.length} New</Badge>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No alerts</p>
            ) : alerts.map((a) => (
              <div key={a.id} className="p-3 rounded-lg bg-primary/10 border-l-2 border-primary">
                <p className="font-medium text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.message}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Route Progress */}
      {stops.length > 0 && (
        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-6">Route Progress</h3>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {stops.map((stop: string, index: number) => {
                const status = index < currentStopIndex ? 'completed' : index === currentStopIndex ? 'current' : 'upcoming';
                return (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 relative">
                    <div className={`h-4 w-4 rounded-full z-10 ${
                      status === 'completed' ? 'bg-success' : status === 'current' ? 'bg-primary pulse-live' : 'bg-muted'
                    }`} />
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${status === 'current' ? 'text-primary' : ''}`}>{stop}</span>
                      </div>
                      {status === 'current' && <Badge className="mt-1 badge-info">Current Location</Badge>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-20 flex-col gap-2 border-destructive/30 hover:bg-destructive/10"
          onClick={handleReportOvercrowding}
          disabled={!bus || occupancy < TOTAL_CAPACITY}
        >
          <Users className="h-6 w-6 text-destructive" />
          <span>Report Overcrowding</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/dashboard/driver/sos'}>
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <span>Report Emergency</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/dashboard/driver/route'}>
          <MapPin className="h-6 w-6 text-primary" />
          <span>View Route</span>
        </Button>
      </div>
    </div>
  );
}
