import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Bus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export default function DriverRoute() {
  const { user } = useAuth();
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: busData } = await supabase
        .from('buses')
        .select('*, routes(*)')
        .eq('driver_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      if (busData) {
        setBus(busData);
        setRoute((busData as any).routes);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const stops = route?.stops as string[] || ['T. Nagar Depot', 'Pondy Bazaar', 'Panagal Park', 'Egmore', 'Central', 'Broadway'];
  const currentStopIndex = 3;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">My Route</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Route Details</h3>
            <Badge className="badge-success">Active</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route</span>
              <span className="font-semibold">{route?.route_number || '21G'} - {route?.route_name || 'T. Nagar → Broadway'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bus</span>
              <span className="font-semibold">{bus?.bus_number || 'TN-01-AB-1234'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-semibold">{route?.distance_km || 18.5} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Time</span>
              <span className="font-semibold">{route?.estimated_time_mins || 45} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Occupancy</span>
              <span className="font-semibold text-warning">{bus?.current_occupancy || 32}/{bus?.total_seats || 40}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Route Progress</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-5">
              {stops.map((stop: string, index: number) => {
                const isCompleted = index < currentStopIndex;
                const isCurrent = index === currentStopIndex;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 relative pl-1"
                  >
                    <div className={`h-3 w-3 rounded-full z-10 ${
                      isCompleted ? 'bg-success' :
                      isCurrent ? 'bg-primary pulse-live' :
                      'bg-muted'
                    }`} />
                    <div className="flex-1 flex justify-between items-center">
                      <span className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                        {typeof stop === 'string' ? stop : (stop as any)?.name || `Stop ${index + 1}`}
                      </span>
                      {isCurrent && <Badge className="badge-info">Current</Badge>}
                      {isCompleted && <Badge variant="outline" className="text-success border-success/30">Done</Badge>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
