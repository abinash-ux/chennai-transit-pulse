import { useState, useEffect } from 'react';
import { Bus, Search, MapPin, Users, Layers } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Chennai coordinates
const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

const busIcon = (pct: number) => L.divIcon({
  className: '',
  html: `<div style="background:${pct > 90 ? '#ef4444' : pct < 30 ? '#22c55e' : '#3b82f6'};color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${pct}%</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function FlyToSearch({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 15, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

export default function AdminFleet() {
  const [buses, setBuses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [view, setView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    supabase
      .from('buses')
      .select('*, routes(route_number, route_name, start_stop, end_stop, stops)')
      .order('bus_number')
      .then(({ data }) => { if (data) setBuses(data); setLoading(false); });
  }, []);

  const filtered = buses.filter(b =>
    b.bus_number.toLowerCase().includes(search.toLowerCase()) ||
    (b.routes as any)?.route_number?.toLowerCase().includes(search.toLowerCase()) ||
    (b.routes as any)?.route_name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeBuses = buses.filter(b => b.status === 'active').length;
  const overcrowded = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) > 0.9).length;
  const underutilized = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) < 0.3).length;

  // Generate positions for buses around Chennai if no real coords
  const getBusPosition = (bus: any, idx: number): [number, number] => {
    if (bus.current_latitude && bus.current_longitude) return [bus.current_latitude, bus.current_longitude];
    const angle = (idx / buses.length) * 2 * Math.PI;
    const r = 0.02 + Math.random() * 0.04;
    return [CHENNAI_CENTER[0] + r * Math.sin(angle), CHENNAI_CENTER[1] + r * Math.cos(angle)];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-2xl font-bold">Fleet Monitor</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={view === 'map' ? 'default' : 'outline'} onClick={() => setView('map')}>
            <Layers className="h-4 w-4 mr-1" />Map
          </Button>
          <Button size="sm" variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>
            <Bus className="h-4 w-4 mr-1" />List
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-primary">{buses.length}</p>
          <p className="text-xs text-muted-foreground">Total Buses</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-success">{activeBuses}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-destructive">{overcrowded}</p>
          <p className="text-xs text-muted-foreground">Overcrowded (90%+)</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-success">{underutilized}</p>
          <p className="text-xs text-muted-foreground">Underutilized (&lt;30%)</p>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bus number, route number, or route name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {view === 'map' ? (
        <GlassCard className="p-0 overflow-hidden" style={{ height: 500 }}>
          <MapContainer center={CHENNAI_CENTER} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedBus && (
              <FlyToSearch
                lat={getBusPosition(selectedBus, buses.indexOf(selectedBus))[0]}
                lng={getBusPosition(selectedBus, buses.indexOf(selectedBus))[1]}
              />
            )}
            {filtered.map((bus, idx) => {
              const pct = bus.total_seats ? Math.round((bus.current_occupancy / bus.total_seats) * 100) : 0;
              const pos = getBusPosition(bus, idx);
              return (
                <Marker key={bus.id} position={pos} icon={busIcon(pct)}>
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <p className="font-bold text-base">{bus.bus_number}</p>
                      {bus.routes && (
                        <p className="text-muted-foreground">
                          Route {bus.routes.route_number} — {bus.routes.route_name}
                        </p>
                      )}
                      <div className="mt-2 space-y-1">
                        <p>Occupancy: <strong>{bus.current_occupancy}/{bus.total_seats}</strong> ({pct}%)</p>
                        <p>Status: <strong className="capitalize">{bus.status}</strong></p>
                        {bus.next_stop && <p>Next Stop: <strong>{bus.next_stop}</strong></p>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && !loading ? (
            <GlassCard className="col-span-full">
              <p className="text-muted-foreground text-center py-8">
                {buses.length === 0 ? 'No buses in system.' : 'No buses match your search.'}
              </p>
            </GlassCard>
          ) : (
            filtered.map((bus) => {
              const pct = bus.total_seats ? Math.round((bus.current_occupancy / bus.total_seats) * 100) : 0;
              return (
                <GlassCard key={bus.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setSelectedBus(bus); setView('map'); }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bus className="h-5 w-5 text-primary" />
                      <span className="font-display font-bold">{bus.bus_number}</span>
                    </div>
                    <Badge className={bus.status === 'active' ? 'badge-success' : 'badge-warning'}>{bus.status}</Badge>
                  </div>
                  {bus.routes && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Route {bus.routes.route_number} — {bus.routes.route_name}
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
      )}
    </div>
  );
}
