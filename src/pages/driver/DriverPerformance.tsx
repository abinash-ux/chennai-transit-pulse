import { motion } from 'framer-motion';
import { Bus, Navigation, Users, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';

export default function DriverPerformance() {
  const weeklyData = [
    { day: 'Mon', trips: 8, distance: 120, passengers: 420 },
    { day: 'Tue', trips: 7, distance: 105, passengers: 380 },
    { day: 'Wed', trips: 9, distance: 135, passengers: 510 },
    { day: 'Thu', trips: 8, distance: 120, passengers: 440 },
    { day: 'Fri', trips: 6, distance: 90, passengers: 340 },
    { day: 'Sat', trips: 5, distance: 75, passengers: 260 },
    { day: 'Sun', trips: 4, distance: 60, passengers: 200 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Performance Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Trips (Month)" value={186} icon={Bus} trend={{ value: 8, positive: true }} />
        <StatCard title="Distance Covered" value={2790} suffix=" km" icon={Navigation} />
        <StatCard title="Passengers Served" value={9450} icon={Users} trend={{ value: 12, positive: true }} />
        <StatCard title="On-Time Rate" value={94} suffix="%" icon={Clock} />
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
                <div className="h-6 rounded bg-primary/60" style={{ width: `${(day.trips / 10) * 100}%` }} />
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
            <p className="text-5xl font-display font-bold text-primary">78%</p>
            <p className="text-muted-foreground mt-2">Average bus utilization</p>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Rating</h3>
          <div className="text-center py-6">
            <p className="text-5xl font-display font-bold text-success">4.6</p>
            <p className="text-muted-foreground mt-2">⭐⭐⭐⭐⭐ (based on 156 ratings)</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
