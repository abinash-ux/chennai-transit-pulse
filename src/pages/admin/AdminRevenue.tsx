import { useState, useEffect } from 'react';
import { Receipt, Ticket, CreditCard, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { supabase } from '@/integrations/supabase/client';

export default function AdminRevenue() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('tickets').select('fare, payment_method'),
      supabase.from('fines').select('amount, status'),
      supabase.from('monthly_passes').select('price'),
    ]).then(([t, f, p]) => {
      if (t.data) setTickets(t.data);
      if (f.data) setFines(f.data);
      if (p.data) setPasses(p.data);
    });
  }, []);

  const ticketRevenue = tickets.reduce((s, t) => s + Number(t.fare), 0);
  const fineRevenue = fines.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0);
  const passRevenue = passes.reduce((s, p) => s + Number(p.price), 0);
  const totalRevenue = ticketRevenue + fineRevenue + passRevenue;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Revenue Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₹" icon={Receipt} />
        <StatCard title="Ticket Revenue" value={ticketRevenue} prefix="₹" icon={Ticket} />
        <StatCard title="Pass Revenue" value={passRevenue} prefix="₹" icon={CreditCard} />
        <StatCard title="Fine Revenue" value={fineRevenue} prefix="₹" icon={AlertTriangle} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Tickets</h3>
          <p className="text-4xl font-display font-bold text-primary">₹{ticketRevenue.toLocaleString()}</p>
          <p className="text-muted-foreground mt-1">{tickets.length} tickets sold</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cash</span>
              <span className="font-medium">{tickets.filter(t => t.payment_method === 'cash').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Digital</span>
              <span className="font-medium">{tickets.filter(t => t.payment_method === 'digital').length}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Monthly Passes</h3>
          <p className="text-4xl font-display font-bold text-success">₹{passRevenue.toLocaleString()}</p>
          <p className="text-muted-foreground mt-1">{passes.length} passes purchased</p>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Fines</h3>
          <p className="text-4xl font-display font-bold text-destructive">₹{fineRevenue.toLocaleString()}</p>
          <p className="text-muted-foreground mt-1">
            {fines.filter(f => f.status === 'paid').length} paid / {fines.length} total
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
