import { motion } from 'framer-motion';
import { Bus, Users, MapPin, AlertTriangle, Receipt, MessageSquare, TrendingUp, Cpu } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const overcrowdedBuses = [
    { number: '21G', route: 'T. Nagar - Central', occupancy: 98, suggestion: 'Add backup bus' },
    { number: '47A', route: 'Central - Broadway', occupancy: 95, suggestion: 'Reroute from 29C' },
  ];

  const underutilizedBuses = [
    { number: '11D', route: 'Adyar - Tambaram', occupancy: 22 },
    { number: '19B', route: 'Guindy - Central', occupancy: 28 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Buses" value={342} icon={Bus} trend={{ value: 5, positive: true }} />
        <StatCard title="Today's Passengers" value={45230} icon={Users} trend={{ value: 12, positive: true }} />
        <StatCard title="Total Revenue" value={567890} prefix="₹" icon={Receipt} />
        <StatCard title="Active Alerts" value={7} icon={AlertTriangle} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              AI Routing Suggestions
            </h3>
            <Badge className="badge-warning">2 Critical</Badge>
          </div>
          <div className="space-y-3">
            {overcrowdedBuses.map((bus, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{bus.number} - {bus.route}</span>
                  <Badge className="badge-danger">{bus.occupancy}% Full</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">AI Suggestion: {bus.suggestion}</p>
                <Button size="sm" className="btn-glow">Apply Suggestion</Button>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Underutilized Buses</h3>
          <div className="space-y-3">
            {underutilizedBuses.map((bus, i) => (
              <div key={i} className="p-4 rounded-lg bg-success/10 border border-success/30">
                <div className="flex justify-between">
                  <span className="font-bold">{bus.number} - {bus.route}</span>
                  <Badge className="badge-success">{bus.occupancy}% Full</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Available for reassignment</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">View Fleet Map</Button>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard>
          <h4 className="font-semibold mb-2">Pending Complaints</h4>
          <p className="text-3xl font-bold text-warning">12</p>
          <Button variant="link" className="p-0 mt-2">Review →</Button>
        </GlassCard>
        <GlassCard>
          <h4 className="font-semibold mb-2">Active SOS</h4>
          <p className="text-3xl font-bold text-destructive">3</p>
          <Button variant="link" className="p-0 mt-2">Respond →</Button>
        </GlassCard>
        <GlassCard>
          <h4 className="font-semibold mb-2">Reroute Requests</h4>
          <p className="text-3xl font-bold text-primary">8</p>
          <Button variant="link" className="p-0 mt-2">Process →</Button>
        </GlassCard>
      </div>
    </div>
  );
}
