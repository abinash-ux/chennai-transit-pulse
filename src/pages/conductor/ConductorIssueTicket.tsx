import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Banknote, Wallet, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const stops = [
  'T. Nagar', 'Central', 'Egmore', 'Broadway', 'Parrys', 'Mylapore', 
  'Adyar', 'Guindy', 'Tambaram', 'Velachery', 'Saidapet', 'Triplicane'
];

export default function ConductorIssueTicket() {
  const { user } = useAuth();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital'>('cash');
  const [ticketIssued, setTicketIssued] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    loadRecentTickets();
  }, [user]);

  const loadRecentTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('issued_by', user.id)
      .order('issued_at', { ascending: false })
      .limit(10);
    if (data) setRecentTickets(data);
  };

  const calculateFare = () => {
    if (fromStop && toStop && fromStop !== toStop) {
      const fromIndex = stops.indexOf(fromStop);
      const toIndex = stops.indexOf(toStop);
      return 10 + Math.abs(toIndex - fromIndex) * 3;
    }
    return 0;
  };

  const handleIssueTicket = async () => {
    const fare = calculateFare();
    if (!fare || !user) return;

    const ticketCode = `TKT-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    // Get conductor's assigned bus
    const { data: busData } = await supabase
      .from('buses')
      .select('id, current_occupancy, route_id')
      .eq('conductor_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    const { data, error } = await supabase.from('tickets').insert({
      ticket_code: ticketCode,
      from_stop: fromStop,
      to_stop: toStop,
      fare,
      payment_method: paymentMethod,
      passenger_id: user.id,
      issued_by: user.id,
      bus_id: busData?.id || null,
      route_id: busData?.route_id || null,
      expires_at: expiresAt,
      qr_data: JSON.stringify({ code: ticketCode, from: fromStop, to: toStop, fare }),
    }).select().single();

    if (error) {
      toast.error('Failed to issue ticket: ' + error.message);
      return;
    }

    // Increment bus occupancy
    if (busData) {
      await supabase.from('buses').update({ 
        current_occupancy: (busData.current_occupancy || 0) + 1 
      }).eq('id', busData.id);
    }

    setIssuedTicket(data);
    setTicketIssued(true);
    toast.success(`Ticket issued for ₹${fare} — Passenger count updated`);
    loadRecentTickets();
  };

  const fare = calculateFare();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Issue Ticket</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard glow>
          <h3 className="font-display text-lg font-bold mb-6">New Ticket</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Stop</Label>
                <Select value={fromStop} onValueChange={setFromStop}>
                  <SelectTrigger><SelectValue placeholder="Boarding" /></SelectTrigger>
                  <SelectContent>
                    {stops.map((s) => <SelectItem key={s} value={s} disabled={s === toStop}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Stop</Label>
                <Select value={toStop} onValueChange={setToStop}>
                  <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                    {stops.map((s) => <SelectItem key={s} value={s} disabled={s === fromStop}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fare > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <p className="text-sm text-muted-foreground">Fare</p>
                <p className="text-4xl font-display font-bold text-primary">₹{fare}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="h-14">
                  <Banknote className="mr-2 h-5 w-5" />Cash
                </Button>
                <Button variant={paymentMethod === 'digital' ? 'default' : 'outline'} onClick={() => setPaymentMethod('digital')} className="h-14">
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
          <h3 className="font-display text-lg font-bold mb-4">Recent Tickets</h3>
          <div className="space-y-2">
            {recentTickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tickets issued yet</p>
            ) : (
              recentTickets.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span>{t.from_stop}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{t.to_stop}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{t.payment_method}</Badge>
                    <span className="font-bold">₹{t.fare}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <Dialog open={ticketIssued} onOpenChange={() => { setTicketIssued(false); setFromStop(''); setToStop(''); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-center">✅ Ticket Issued</DialogTitle></DialogHeader>
          {issuedTicket && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG value={issuedTicket.qr_data || ''} size={150} />
              </div>
              <p className="font-mono font-bold">{issuedTicket.ticket_code}</p>
              <p className="text-muted-foreground">{issuedTicket.from_stop} → {issuedTicket.to_stop}</p>
              <p className="text-2xl font-bold text-primary">₹{issuedTicket.fare}</p>
              <Button onClick={() => { setTicketIssued(false); setFromStop(''); setToStop(''); }} className="w-full">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
