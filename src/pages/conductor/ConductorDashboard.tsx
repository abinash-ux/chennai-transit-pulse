import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Users, CreditCard, QrCode, Wallet, Banknote, ArrowRight, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

const TOTAL_CAPACITY = 70;
const SEATED_CAPACITY = 40;

const defaultStops = [
  'T. Nagar', 'Central', 'Egmore', 'Broadway', 'Parrys', 'Mylapore', 
  'Adyar', 'Guindy', 'Tambaram', 'Velachery', 'Saidapet', 'Triplicane'
];

export default function ConductorDashboard() {
  const { user } = useAuth();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital'>('cash');
  const [ticketIssued, setTicketIssued] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ ticketsIssued: 0, cashRevenue: 0, digitalRevenue: 0, passValidations: 0 });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const { data: busData } = await supabase
      .from('buses')
      .select('*, routes(route_number, route_name, stops)')
      .eq('conductor_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (busData) setBus(busData);

    const today = new Date().toISOString().split('T')[0];
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('issued_by', user.id)
      .gte('issued_at', today)
      .order('issued_at', { ascending: false });

    if (tickets) {
      setRecentTickets(tickets.slice(0, 5));
      const cash = tickets.filter(t => t.payment_method === 'cash');
      const digital = tickets.filter(t => t.payment_method === 'digital');
      setStats({
        ticketsIssued: tickets.length,
        cashRevenue: cash.reduce((s, t) => s + Number(t.fare), 0),
        digitalRevenue: digital.reduce((s, t) => s + Number(t.fare), 0),
        passValidations: 0,
      });
    }
  };

  const stops = bus?.routes?.stops 
    ? (typeof bus.routes.stops === 'string' ? JSON.parse(bus.routes.stops) : bus.routes.stops) 
    : defaultStops;

  const calculateFare = () => {
    if (fromStop && toStop && fromStop !== toStop) {
      const fromIndex = stops.indexOf(fromStop);
      const toIndex = stops.indexOf(toStop);
      const distance = Math.abs(toIndex - fromIndex);
      return 10 + distance * 3;
    }
    return 0;
  };

  const handleIssueTicket = async () => {
    const fare = calculateFare();
    if (!fare || !user) return;

    const ticketCode = `TKT-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase.from('tickets').insert({
      ticket_code: ticketCode, from_stop: fromStop, to_stop: toStop, fare,
      payment_method: paymentMethod, passenger_id: user.id, issued_by: user.id,
      bus_id: bus?.id || null, route_id: bus?.route_id || null, expires_at: expiresAt,
      qr_data: JSON.stringify({ code: ticketCode, from: fromStop, to: toStop, fare }),
    }).select().single();

    if (error) { toast.error('Failed to issue ticket'); return; }

    if (bus) {
      await supabase.from('buses').update({ current_occupancy: bus.current_occupancy + 1 }).eq('id', bus.id);
    }

    setIssuedTicket(data);
    setTicketIssued(true);
    toast.success(`Ticket issued for ₹${fare}`);
    loadData();
  };

  const closeTicketDialog = () => { setTicketIssued(false); setFromStop(''); setToStop(''); };

  const occupancy = bus?.current_occupancy || 0;
  const seated = Math.min(occupancy, SEATED_CAPACITY);
  const standing = Math.max(0, occupancy - SEATED_CAPACITY);
  const pct = Math.round((occupancy / TOTAL_CAPACITY) * 100);

  const handleReportOvercrowding = async () => {
    if (!user || !bus) return;
    await supabase.from('sos_alerts').insert({
      reported_by: user.id,
      reporter_role: 'conductor' as const,
      sos_type: 'other' as const,
      description: `Bus ${bus.bus_number} is overcrowded at ${occupancy}/${TOTAL_CAPACITY} passengers (${pct}% capacity). Seated: ${seated}, Standing: ${standing}.`,
      bus_id: bus.id,
    });
    toast.success('Overcrowding alert sent to Admin!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tickets Issued" value={stats.ticketsIssued} icon={Ticket} />
        <StatCard title="Cash Revenue" value={stats.cashRevenue} prefix="₹" icon={Banknote} />
        <StatCard title="Digital Revenue" value={stats.digitalRevenue} prefix="₹" icon={CreditCard} />
        <StatCard title="Bus Load" value={occupancy} suffix={`/${TOTAL_CAPACITY}`} icon={Users} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Issue Ticket</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Stop</Label>
                <Select value={fromStop} onValueChange={setFromStop}>
                  <SelectTrigger><SelectValue placeholder="Boarding" /></SelectTrigger>
                  <SelectContent>
                    {stops.map((stop: string) => (
                      <SelectItem key={stop} value={stop} disabled={stop === toStop}>{stop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Stop</Label>
                <Select value={toStop} onValueChange={setToStop}>
                  <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                    {stops.map((stop: string) => (
                      <SelectItem key={stop} value={stop} disabled={stop === fromStop}>{stop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {calculateFare() > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <p className="text-sm text-muted-foreground">Fare Amount</p>
                <p className="text-4xl font-display font-bold text-primary">₹{calculateFare()}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="h-16">
                  <Banknote className="mr-2 h-5 w-5" />Cash
                </Button>
                <Button variant={paymentMethod === 'digital' ? 'default' : 'outline'} onClick={() => setPaymentMethod('digital')} className="h-16">
                  <Wallet className="mr-2 h-5 w-5" />Digital
                </Button>
              </div>
            </div>

            <Button className="w-full btn-glow h-14 text-lg" onClick={handleIssueTicket}
              disabled={!fromStop || !toStop || fromStop === toStop}>
              <Ticket className="mr-2 h-5 w-5" />Issue Ticket
            </Button>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Current Bus Status</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bus Number</p>
                <p className="text-2xl font-display font-bold">{bus?.bus_number || 'Not Assigned'}</p>
              </div>
              {bus?.routes && <Badge className="badge-success">Route {bus.routes.route_number}</Badge>}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Passenger Load</span>
                <span className="font-bold">{occupancy} / {TOTAL_CAPACITY}</span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-warning' : 'bg-success'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Seated: {seated}/{SEATED_CAPACITY}</span>
                <span>Standing: {standing}/{TOTAL_CAPACITY - SEATED_CAPACITY}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-success">{seated}</p>
                <p className="text-sm text-muted-foreground">Seated</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-warning">{standing}</p>
                <p className="text-sm text-muted-foreground">Standing</p>
              </div>
            </div>

            {/* Report Overcrowding Button — always visible when bus is at capacity */}
            <Button
              variant="outline"
              className="w-full border-destructive/30 hover:bg-destructive/10"
              onClick={handleReportOvercrowding}
              disabled={!bus || occupancy < TOTAL_CAPACITY}
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
              Report Overcrowding
            </Button>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-display text-lg font-semibold mb-4">Recent Tickets</h3>
        <div className="space-y-2">
          {recentTickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No tickets issued today</p>
          ) : recentTickets.map((ticket) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <Ticket className="h-4 w-4 text-primary" />
                <span>{ticket.from_stop}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span>{ticket.to_stop}</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {ticket.payment_method === 'cash' ? <Banknote className="h-3 w-3 mr-1" /> : <CreditCard className="h-3 w-3 mr-1" />}
                  {ticket.payment_method}
                </Badge>
                <span className="font-bold">₹{ticket.fare}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <Dialog open={ticketIssued} onOpenChange={closeTicketDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">✅ Ticket Issued</DialogTitle>
          </DialogHeader>
          {issuedTicket && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG value={issuedTicket.qr_data || ''} size={150} />
              </div>
              <div className="text-center">
                <p className="font-mono font-bold">{issuedTicket.ticket_code}</p>
                <p className="text-muted-foreground">{issuedTicket.from_stop} → {issuedTicket.to_stop}</p>
                <p className="text-2xl font-bold text-primary mt-2">₹{issuedTicket.fare}</p>
              </div>
              <Button onClick={closeTicketDialog} className="w-full">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
