import { motion } from 'framer-motion';
import { Bus, MapPin, Users, Clock, AlertTriangle, Navigation, Bell } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DriverDashboard() {
  const routeStops = [
    { name: 'T. Nagar Depot', status: 'completed', time: '06:00' },
    { name: 'Pondy Bazaar', status: 'completed', time: '06:15' },
    { name: 'Panagal Park', status: 'completed', time: '06:25' },
    { name: 'Egmore', status: 'current', time: '06:40' },
    { name: 'Central', status: 'upcoming', time: '07:00' },
    { name: 'Broadway', status: 'upcoming', time: '07:20' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Trips" value={6} icon={Bus} />
        <StatCard title="Passengers Served" value={342} icon={Users} trend={{ value: 12, positive: true }} />
        <StatCard title="Distance Covered" value={84} suffix=" km" icon={Navigation} />
        <StatCard title="On-Time Rate" value={94} suffix="%" icon={Clock} />
      </div>

      {/* Current Assignment */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard glow className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-bold">Current Assignment</h3>
              <p className="text-muted-foreground">Bus TN-01-AB-1234</p>
            </div>
            <Badge className="badge-success text-base px-4 py-1">
              <span className="h-2 w-2 rounded-full bg-success mr-2 pulse-live" />
              Active
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-primary">21G</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">T. Nagar → Broadway</p>
                  <p className="text-muted-foreground">Via Egmore, Central</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Distance</span>
                  <span className="font-semibold">18.5 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Time</span>
                  <span className="font-semibold">45 mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Occupancy</span>
                  <span className="font-semibold text-warning">32/40 (80%)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Occupancy Level</h4>
              <div className="relative h-32 flex items-end justify-center gap-2">
                {[65, 80, 72, 85, 90, 78, 80].map((val, i) => (
                  <motion.div
                    key={i}
                    className="w-8 rounded-t-md bg-primary/50"
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      background: val > 85 ? 'hsl(var(--warning))' : 'hsl(var(--primary))',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>6AM</span>
                <span>7AM</span>
                <span>8AM</span>
                <span>9AM</span>
                <span>10AM</span>
                <span>11AM</span>
                <span>12PM</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Alerts */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Route Alerts
            </h3>
            <Badge variant="outline">3 New</Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-warning/10 border-l-2 border-warning">
              <p className="font-medium text-sm">Traffic congestion ahead</p>
              <p className="text-xs text-muted-foreground">Near Egmore station • 5 mins ago</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border-l-2 border-primary">
              <p className="font-medium text-sm">Route change notification</p>
              <p className="text-xs text-muted-foreground">Diversion at Central • Admin</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10 border-l-2 border-success">
              <p className="font-medium text-sm">Shift ends at 2:00 PM</p>
              <p className="text-xs text-muted-foreground">2 more trips remaining</p>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4">View All Alerts</Button>
        </GlassCard>
      </div>

      {/* Route Progress */}
      <GlassCard>
        <h3 className="font-display text-lg font-semibold mb-6">Route Progress</h3>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {routeStops.map((stop, index) => (
              <motion.div
                key={stop.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 relative"
              >
                <div className={`h-4 w-4 rounded-full z-10 ${
                  stop.status === 'completed' ? 'bg-success' :
                  stop.status === 'current' ? 'bg-primary pulse-live' :
                  'bg-muted'
                }`} />
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      stop.status === 'current' ? 'text-primary' : ''
                    }`}>{stop.name}</span>
                    <span className="text-sm text-muted-foreground">{stop.time}</span>
                  </div>
                  {stop.status === 'current' && (
                    <Badge className="mt-1 badge-info">Current Location</Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <span>Report Emergency</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Bus className="h-6 w-6 text-warning" />
          <span>Request Backup</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span>Report Traffic</span>
        </Button>
      </div>
    </div>
  );
}
