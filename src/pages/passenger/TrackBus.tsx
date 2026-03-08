import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Bus, Users, MapPin, Navigation } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Chennai center coordinates
const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

// Custom bus icon
const createBusIcon = (occupancy: number) => {
  const color = occupancy >= 90 ? '#ef4444' : occupancy >= 60 ? '#f59e0b' : '#22c55e';
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M8 6v6"></path>
          <path d="M16 6v6"></path>
          <path d="M2 12h19.6"></path>
          <path d="M18 18h2a1 1 0 0 0 1-1v-7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a1 1 0 0 0 1 1h2"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <circle cx="17" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Mock bus data
const mockBuses = [
  { id: '1', number: '21G', route: 'T. Nagar - Central', lat: 13.0827, lng: 80.2707, occupancy: 75, nextStop: 'Egmore', eta: '5 mins' },
  { id: '2', number: '47A', route: 'Central - Broadway', lat: 13.0900, lng: 80.2800, occupancy: 45, nextStop: 'Parrys', eta: '3 mins' },
  { id: '3', number: '29C', route: 'Broadway - Mylapore', lat: 13.0750, lng: 80.2600, occupancy: 95, nextStop: 'Triplicane', eta: '8 mins' },
  { id: '4', number: '11D', route: 'Adyar - Tambaram', lat: 13.0600, lng: 80.2500, occupancy: 30, nextStop: 'Velachery', eta: '12 mins' },
  { id: '5', number: '19B', route: 'Guindy - Central', lat: 13.0050, lng: 80.2200, occupancy: 88, nextStop: 'Saidapet', eta: '6 mins' },
];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14);
  }, [center, map]);
  return null;
}

export default function TrackBus() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState<typeof mockBuses[0] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(CHENNAI_CENTER);
  const [filteredBuses, setFilteredBuses] = useState(mockBuses);

  useEffect(() => {
    if (searchQuery) {
      const filtered = mockBuses.filter(
        (bus) =>
          bus.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.route.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuses(filtered);
    } else {
      setFilteredBuses(mockBuses);
    }
  }, [searchQuery]);

  const handleBusSelect = (bus: typeof mockBuses[0]) => {
    setSelectedBus(bus);
    setMapCenter([bus.lat, bus.lng]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Live Bus Tracking</h2>
          <p className="text-muted-foreground">Track buses in real-time across Chennai</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="space-y-4">
          <GlassCard>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bus number or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-glow"
              />
            </div>
          </GlassCard>

          <GlassCard className="max-h-[400px] overflow-y-auto">
            <h3 className="font-semibold mb-3 sticky top-0 bg-card pb-2">Available Buses ({filteredBuses.length})</h3>
            <div className="space-y-2">
              {filteredBuses.map((bus) => (
                <motion.button
                  key={bus.id}
                  onClick={() => handleBusSelect(bus)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedBus?.id === bus.id
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-muted/20 hover:bg-muted/40'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-primary">{bus.number}</span>
                    <Badge className={
                      bus.occupancy >= 90 ? 'badge-danger' :
                      bus.occupancy >= 60 ? 'badge-warning' : 'badge-success'
                    }>
                      {bus.occupancy}% Full
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{bus.route}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>Next: {bus.nextStop}</span>
                    <span className="text-primary">• {bus.eta}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <GlassCard className="p-0 overflow-hidden h-[500px]">
            <MapContainer
              center={CHENNAI_CENTER}
              zoom={13}
              className="h-full w-full"
              style={{ background: 'hsl(222 47% 6%)' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapController center={mapCenter} />
              {filteredBuses.map((bus) => (
                <Marker
                  key={bus.id}
                  position={[bus.lat, bus.lng]}
                  icon={createBusIcon(bus.occupancy)}
                  eventHandlers={{
                    click: () => handleBusSelect(bus),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">{bus.number}</span>
                        <span className={`text-sm ${
                          bus.occupancy >= 90 ? 'text-red-500' :
                          bus.occupancy >= 60 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {bus.occupancy}% Full
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{bus.route}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Navigation className="h-3 w-3" />
                        <span>Next: {bus.nextStop} ({bus.eta})</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </GlassCard>
        </div>
      </div>

      {/* Selected Bus Details */}
      {selectedBus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard glow>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">{selectedBus.number}</h3>
                  <p className="text-muted-foreground">{selectedBus.route}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{selectedBus.occupancy}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Occupancy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedBus.eta}</p>
                  <p className="text-xs text-muted-foreground">to {selectedBus.nextStop}</p>
                </div>
                <Button className="btn-glow">
                  <Ticket className="mr-2 h-4 w-4" />
                  Buy Ticket
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

// Add missing Ticket icon import
import { Ticket } from 'lucide-react';
