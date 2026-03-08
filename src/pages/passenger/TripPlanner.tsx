import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowDown, Clock, IndianRupee, Bus, Navigation, Search } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const stops = [
  'T. Nagar', 'Central', 'Egmore', 'Broadway', 'Parrys', 'Mylapore',
  'Adyar', 'Guindy', 'Tambaram', 'Velachery', 'Saidapet', 'Triplicane',
  'Porur', 'Vadapalani', 'Koyambedu', 'Anna Nagar', 'Kilpauk', 'Nungambakkam'
];

// Mock route graph for trip planning
const directRoutes: Record<string, { bus: string; time: number; fare: number }[]> = {
  'T. Nagar→Central': [{ bus: '21G', time: 25, fare: 25 }],
  'Central→T. Nagar': [{ bus: '21G', time: 25, fare: 25 }],
  'Central→Broadway': [{ bus: '47A', time: 15, fare: 15 }],
  'Broadway→Central': [{ bus: '47A', time: 15, fare: 15 }],
  'Broadway→Mylapore': [{ bus: '29C', time: 20, fare: 20 }],
  'Mylapore→Broadway': [{ bus: '29C', time: 20, fare: 20 }],
  'Adyar→Tambaram': [{ bus: '11D', time: 45, fare: 30 }],
  'Tambaram→Adyar': [{ bus: '11D', time: 45, fare: 30 }],
  'Guindy→Central': [{ bus: '19B', time: 35, fare: 25 }],
  'Central→Guindy': [{ bus: '19B', time: 35, fare: 25 }],
  'T. Nagar→Guindy': [{ bus: '17E', time: 20, fare: 18 }],
  'Guindy→T. Nagar': [{ bus: '17E', time: 20, fare: 18 }],
  'Egmore→Mylapore': [{ bus: '23C', time: 18, fare: 15 }],
  'Mylapore→Egmore': [{ bus: '23C', time: 18, fare: 15 }],
  'Koyambedu→Central': [{ bus: '15A', time: 30, fare: 22 }],
  'Central→Koyambedu': [{ bus: '15A', time: 30, fare: 22 }],
  'Anna Nagar→T. Nagar': [{ bus: '102', time: 25, fare: 20 }],
  'T. Nagar→Anna Nagar': [{ bus: '102', time: 25, fare: 20 }],
  'Velachery→Guindy': [{ bus: '51B', time: 20, fare: 15 }],
  'Guindy→Velachery': [{ bus: '51B', time: 20, fare: 15 }],
  'Adyar→Mylapore': [{ bus: '5C', time: 15, fare: 12 }],
  'Mylapore→Adyar': [{ bus: '5C', time: 15, fare: 12 }],
};

// Transfer hubs for connecting routes
const transferHubs = ['Central', 'T. Nagar', 'Guindy', 'Broadway', 'Egmore', 'Mylapore'];

interface RouteResult {
  type: 'direct' | 'connecting';
  segments: { bus: string; from: string; to: string; time: number; fare: number }[];
  totalTime: number;
  totalFare: number;
}

function findRoutes(from: string, to: string): RouteResult[] {
  const results: RouteResult[] = [];
  const key = `${from}→${to}`;

  // Check direct
  if (directRoutes[key]) {
    for (const r of directRoutes[key]) {
      results.push({
        type: 'direct',
        segments: [{ bus: r.bus, from, to, time: r.time, fare: r.fare }],
        totalTime: r.time,
        totalFare: r.fare,
      });
    }
  }

  // Check connecting via transfer hubs
  for (const hub of transferHubs) {
    if (hub === from || hub === to) continue;
    const leg1Key = `${from}→${hub}`;
    const leg2Key = `${hub}→${to}`;
    if (directRoutes[leg1Key] && directRoutes[leg2Key]) {
      const r1 = directRoutes[leg1Key][0];
      const r2 = directRoutes[leg2Key][0];
      results.push({
        type: 'connecting',
        segments: [
          { bus: r1.bus, from, to: hub, time: r1.time, fare: r1.fare },
          { bus: r2.bus, from: hub, to, time: r2.time, fare: r2.fare },
        ],
        totalTime: r1.time + r2.time + 5, // 5 min transfer
        totalFare: r1.fare + r2.fare,
      });
    }
  }

  // Sort by time
  results.sort((a, b) => a.totalTime - b.totalTime);
  return results.slice(0, 5);
}

export default function TripPlanner() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (from && to && from !== to) {
      setRoutes(findRoutes(from, to));
      setSearched(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Trip Planner</h2>
        <p className="text-muted-foreground">Find the best bus routes for your journey</p>
      </div>

      <GlassCard>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                From Location
              </Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="input-glow">
                  <SelectValue placeholder="Select start point" />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((s) => (
                    <SelectItem key={s} value={s} disabled={s === to}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-muted">
                <ArrowDown className="h-4 w-4 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                To Location
              </Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="input-glow">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((s) => (
                    <SelectItem key={s} value={s} disabled={s === from}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!from || !to || from === to}
              className="w-full btn-glow"
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" />
              Find Routes
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold">
              {searched ? `Routes: ${from} → ${to}` : 'Route Results'}
            </h3>

            {!searched && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Navigation className="h-12 w-12 mb-3 opacity-40" />
                <p>Select your stops and search to see routes</p>
              </div>
            )}

            {searched && routes.length === 0 && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
                <p className="font-medium">No routes found</p>
                <p className="text-sm text-muted-foreground mt-1">Try different stops</p>
              </div>
            )}

            {routes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-success/10 border-success/30' : 'bg-muted/20 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Badge className="bg-success text-success-foreground">Fastest</Badge>}
                    <Badge variant="outline">
                      {route.type === 'direct' ? 'Direct' : 'Connecting'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {route.totalTime} mins
                    </span>
                    <span className="flex items-center gap-1 font-bold text-primary">
                      <IndianRupee className="h-3 w-3" />
                      {route.totalFare}
                    </span>
                  </div>
                </div>

                {route.segments.map((seg, si) => (
                  <div key={si}>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-1.5 rounded-full bg-primary/20">
                        <Bus className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-bold text-primary">{seg.bus}</span>
                      <span>{seg.from}</span>
                      <ArrowDown className="h-3 w-3 rotate-[-90deg]" />
                      <span>{seg.to}</span>
                      <span className="text-muted-foreground ml-auto">{seg.time} mins • ₹{seg.fare}</span>
                    </div>
                    {si < route.segments.length - 1 && (
                      <div className="ml-8 my-1 text-xs text-warning flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Transfer at {seg.to} (~5 min wait)
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
