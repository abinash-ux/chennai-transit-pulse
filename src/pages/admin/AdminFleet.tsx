import { useState, useEffect } from 'react';
import { Bus, Search, MapPin, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

export default function AdminFleet() {
  const [buses, setBuses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('buses')
      .select('*, routes(route_number, route_name)')
      .order('bus_number')
      .then(({ data }) => { if (data) setBuses(data); setLoading(false); });
  }, []);

  const filtered = buses.filter(b =>
    b.bus_number.toLowerCase().includes(search.toLowerCase()) ||
    (b.routes as any)?.route_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Fleet Monitor</h2>
        <Badge>{buses.length} Buses</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by bus number or route..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && !loading ? (
          <GlassCard className="col-span-full">
            <p className="text-muted-foreground text-center py-8">
              {buses.length === 0 ? 'No buses in system. Add buses to monitor fleet.' : 'No buses match your search.'}
            </p>
          </GlassCard>
        ) : (
          filtered.map((bus) => {
            const pct = bus.total_seats ? Math.round((bus.current_occupancy / bus.total_seats) * 100) : 0;
            return (
              <GlassCard key={bus.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold">{bus.bus_number}</span>
                  </div>
                  <Badge className={bus.status === 'active' ? 'badge-success' : 'badge-warning'}>{bus.status}</Badge>
                </div>
                {(bus as any).routes && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Route {(bus as any).routes.route_number} - {(bus as any).routes.route_name}
                  </p>
                )}
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-semibold">{bus.current_occupancy}/{bus.total_seats} ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
                {bus.next_stop && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Next: {bus.next_stop}</span>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
