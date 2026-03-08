import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, Ticket, Search, Filter, QrCode, Clock, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

const stops = [
  'T. Nagar', 'Central', 'Egmore', 'Broadway', 'Parrys', 'Mylapore', 
  'Adyar', 'Guindy', 'Tambaram', 'Velachery', 'Saidapet', 'Triplicane'
];

// Mock tickets
const mockTickets = [
  { id: '1', code: 'TKT-2024-001', from: 'T. Nagar', to: 'Central', fare: 25, status: 'active', route: '21G', issuedAt: '2024-03-08T10:00:00', expiresAt: '2024-03-08T14:00:00' },
  { id: '2', code: 'TKT-2024-002', from: 'Central', to: 'Broadway', fare: 15, status: 'used', route: '47A', issuedAt: '2024-03-07T09:00:00', expiresAt: '2024-03-07T13:00:00' },
  { id: '3', code: 'TKT-2024-003', from: 'Broadway', to: 'Mylapore', fare: 20, status: 'expired', route: '29C', issuedAt: '2024-03-06T14:00:00', expiresAt: '2024-03-06T18:00:00' },
];

export default function PassengerTickets() {
  const { user } = useAuth();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null);
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const calculateFare = () => {
    if (fromStop && toStop && fromStop !== toStop) {
      // Simple fare calculation based on stops
      const fromIndex = stops.indexOf(fromStop);
      const toIndex = stops.indexOf(toStop);
      const distance = Math.abs(toIndex - fromIndex);
      const fare = 10 + distance * 3; // Base fare + per stop charge
      setCalculatedFare(fare);
    }
  };

  const handleBookTicket = async () => {
    if (!calculatedFare) return;
    
    setIsBooking(true);
    // Simulate booking
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTicket = {
      id: Date.now().toString(),
      code: `TKT-${Date.now()}`,
      from: fromStop,
      to: toStop,
      fare: calculatedFare,
      status: 'active' as const,
      route: '21G',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    };
    
    setTickets([newTicket, ...tickets]);
    setSelectedTicket(newTicket);
    setShowQR(true);
    setIsBooking(false);
    setFromStop('');
    setToStop('');
    setCalculatedFare(null);
    
    toast.success('Ticket booked successfully!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="badge-success"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'used':
        return <Badge className="badge-info"><CheckCircle className="h-3 w-3 mr-1" />Used</Badge>;
      case 'expired':
        return <Badge className="badge-danger"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">My Tickets</h2>
          <p className="text-muted-foreground">Purchase and manage your bus tickets</p>
        </div>
      </div>

      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="buy">Buy Ticket</TabsTrigger>
          <TabsTrigger value="history">Ticket History</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="font-display text-lg font-semibold mb-6">Smart Trip Planner</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>From Stop</Label>
                  <Select value={fromStop} onValueChange={setFromStop}>
                    <SelectTrigger className="input-glow">
                      <SelectValue placeholder="Select boarding point" />
                    </SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={stop} value={stop} disabled={stop === toStop}>
                          {stop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <div className="p-2 rounded-full bg-muted">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>To Stop</Label>
                  <Select value={toStop} onValueChange={setToStop}>
                    <SelectTrigger className="input-glow">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={stop} value={stop} disabled={stop === fromStop}>
                          {stop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateFare}
                  disabled={!fromStop || !toStop}
                  className="w-full"
                  variant="secondary"
                >
                  Calculate Fare
                </Button>

                {calculatedFare && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Estimated Fare</span>
                      <span className="text-3xl font-display font-bold text-primary">₹{calculatedFare}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Available buses: 21G, 47A, 29C</p>
                      <p>Estimated time: 25-35 mins</p>
                    </div>
                  </motion.div>
                )}

                <Button 
                  onClick={handleBookTicket}
                  disabled={!calculatedFare || isBooking}
                  className="w-full btn-glow"
                >
                  {isBooking ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Ticket className="mr-2 h-4 w-4" />
                      Pay from Wallet & Book
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>

            {/* Route Suggestions */}
            <GlassCard>
              <h3 className="font-display text-lg font-semibold mb-4">Suggested Routes</h3>
              <div className="space-y-3">
                {fromStop && toStop ? (
                  <>
                    <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-success">Direct Route</span>
                        <Badge className="badge-success">Fastest</Badge>
                      </div>
                      <p className="text-sm">Bus 21G • 25 mins • ₹{calculatedFare || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">With 1 Connection</span>
                        <Badge variant="outline">Alternative</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        47A to Central → 29C to destination • 40 mins • ₹{(calculatedFare || 0) + 10}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select your stops to see route suggestions</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">All Tickets</h3>
              <div className="flex items-center gap-2">
                <Input placeholder="Search tickets..." className="w-48" />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{ticket.from}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{ticket.to}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Route {ticket.route}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(ticket.issuedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">₹{ticket.fare}</span>
                    {getStatusBadge(ticket.status)}
                    {ticket.status === 'active' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4 mr-1" />
                            Show QR
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Your Ticket QR Code</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4 p-4">
                            <div className="p-4 bg-white rounded-xl">
                              <QRCodeSVG
                                value={JSON.stringify({
                                  code: ticket.code,
                                  from: ticket.from,
                                  to: ticket.to,
                                  fare: ticket.fare,
                                  expires: ticket.expiresAt,
                                })}
                                size={200}
                              />
                            </div>
                            <div className="text-center">
                              <p className="font-mono text-lg font-bold">{ticket.code}</p>
                              <p className="text-sm text-muted-foreground">
                                Valid until: {new Date(ticket.expiresAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* New Ticket QR Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">🎉 Ticket Booked Successfully!</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG
                  value={JSON.stringify({
                    code: selectedTicket.code,
                    from: selectedTicket.from,
                    to: selectedTicket.to,
                    fare: selectedTicket.fare,
                    expires: selectedTicket.expiresAt,
                  })}
                  size={200}
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-lg font-bold">{selectedTicket.code}</p>
                <p className="text-muted-foreground">
                  {selectedTicket.from} → {selectedTicket.to}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Show this QR code to the conductor
                </p>
              </div>
              <Button onClick={() => setShowQR(false)} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
