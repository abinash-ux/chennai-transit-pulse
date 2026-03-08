import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Users, CreditCard, QrCode, Wallet, Banknote, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const stops = [
  'T. Nagar', 'Central', 'Egmore', 'Broadway', 'Parrys', 'Mylapore', 
  'Adyar', 'Guindy', 'Tambaram', 'Velachery', 'Saidapet', 'Triplicane'
];

export default function ConductorDashboard() {
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital'>('cash');
  const [ticketIssued, setTicketIssued] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({
    ticketsIssued: 156,
    cashRevenue: 2340,
    digitalRevenue: 1560,
    passValidations: 23,
  });

  const calculateFare = () => {
    if (fromStop && toStop && fromStop !== toStop) {
      const fromIndex = stops.indexOf(fromStop);
      const toIndex = stops.indexOf(toStop);
      const distance = Math.abs(toIndex - fromIndex);
      return 10 + distance * 3;
    }
    return 0;
  };

  const handleIssueTicket = () => {
    const fare = calculateFare();
    if (!fare) return;

    const ticket = {
      code: `TKT-${Date.now()}`,
      from: fromStop,
      to: toStop,
      fare,
      paymentMethod,
      issuedAt: new Date().toISOString(),
    };

    setIssuedTicket(ticket);
    setTicketIssued(true);

    // Update stats
    setTodayStats(prev => ({
      ...prev,
      ticketsIssued: prev.ticketsIssued + 1,
      cashRevenue: paymentMethod === 'cash' ? prev.cashRevenue + fare : prev.cashRevenue,
      digitalRevenue: paymentMethod === 'digital' ? prev.digitalRevenue + fare : prev.digitalRevenue,
    }));

    toast.success(`Ticket issued for ₹${fare}`);
  };

  const closeTicketDialog = () => {
    setTicketIssued(false);
    setFromStop('');
    setToStop('');
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tickets Issued" value={todayStats.ticketsIssued} icon={Ticket} />
        <StatCard title="Cash Revenue" value={todayStats.cashRevenue} prefix="₹" icon={Banknote} />
        <StatCard title="Digital Revenue" value={todayStats.digitalRevenue} prefix="₹" icon={CreditCard} />
        <StatCard title="Pass Validations" value={todayStats.passValidations} icon={Users} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Issue Ticket */}
        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Issue Ticket</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Stop</Label>
                <Select value={fromStop} onValueChange={setFromStop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Boarding" />
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
              <div className="space-y-2">
                <Label>To Stop</Label>
                <Select value={toStop} onValueChange={setToStop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Destination" />
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
            </div>

            {calculateFare() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center"
              >
                <p className="text-sm text-muted-foreground">Fare Amount</p>
                <p className="text-4xl font-display font-bold text-primary">₹{calculateFare()}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="h-16"
                >
                  <Banknote className="mr-2 h-5 w-5" />
                  Cash
                </Button>
                <Button
                  variant={paymentMethod === 'digital' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('digital')}
                  className="h-16"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Digital
                </Button>
              </div>
            </div>

            <Button
              className="w-full btn-glow h-14 text-lg"
              onClick={handleIssueTicket}
              disabled={!fromStop || !toStop || fromStop === toStop}
            >
              <Ticket className="mr-2 h-5 w-5" />
              Issue Ticket
            </Button>
          </div>
        </GlassCard>

        {/* Passenger Load */}
        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Current Bus Status</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bus Number</p>
                <p className="text-2xl font-display font-bold">TN-01-AB-1234</p>
              </div>
              <Badge className="badge-success">Route 21G</Badge>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Passenger Load</span>
                <span className="font-bold">32 / 40</span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-warning rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Seated: 28</span>
                <span>Standing: 4</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-success">28</p>
                <p className="text-sm text-muted-foreground">Seated</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-warning">4</p>
                <p className="text-sm text-muted-foreground">Standing</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => toast.info('Overcrowding alert sent to admin')}>
              <Users className="mr-2 h-4 w-4" />
              Report Overcrowding
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Recent Tickets */}
      <GlassCard>
        <h3 className="font-display text-lg font-semibold mb-4">Recent Tickets</h3>
        <div className="space-y-2">
          {[
            { from: 'T. Nagar', to: 'Egmore', fare: 16, method: 'cash', time: '2 mins ago' },
            { from: 'Egmore', to: 'Central', fare: 13, method: 'digital', time: '5 mins ago' },
            { from: 'Central', to: 'Broadway', fare: 19, method: 'cash', time: '8 mins ago' },
          ].map((ticket, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
            >
              <div className="flex items-center gap-3">
                <Ticket className="h-4 w-4 text-primary" />
                <span>{ticket.from}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span>{ticket.to}</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {ticket.method === 'cash' ? <Banknote className="h-3 w-3 mr-1" /> : <CreditCard className="h-3 w-3 mr-1" />}
                  {ticket.method}
                </Badge>
                <span className="font-bold">₹{ticket.fare}</span>
                <span className="text-sm text-muted-foreground">{ticket.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Ticket Issued Dialog */}
      <Dialog open={ticketIssued} onOpenChange={closeTicketDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">✅ Ticket Issued</DialogTitle>
          </DialogHeader>
          {issuedTicket && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG value={JSON.stringify(issuedTicket)} size={150} />
              </div>
              <div className="text-center">
                <p className="font-mono font-bold">{issuedTicket.code}</p>
                <p className="text-muted-foreground">
                  {issuedTicket.from} → {issuedTicket.to}
                </p>
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
