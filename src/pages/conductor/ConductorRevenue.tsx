import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Banknote, CreditCard, Ticket } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export default function ConductorRevenue() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('tickets')
      .select('*')
      .eq('issued_by', user.id)
      .order('issued_at', { ascending: false })
      .then(({ data }) => { if (data) setTickets(data); });
  }, [user]);

  const cashTickets = tickets.filter(t => t.payment_method === 'cash');
  const digitalTickets = tickets.filter(t => t.payment_method === 'digital');
  const cashRevenue = cashTickets.reduce((sum, t) => sum + Number(t.fare), 0);
  const digitalRevenue = digitalTickets.reduce((sum, t) => sum + Number(t.fare), 0);
  const totalRevenue = cashRevenue + digitalRevenue;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Revenue Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₹" icon={Receipt} />
        <StatCard title="Cash Revenue" value={cashRevenue} prefix="₹" icon={Banknote} />
        <StatCard title="Digital Revenue" value={digitalRevenue} prefix="₹" icon={CreditCard} />
        <StatCard title="Total Tickets" value={tickets.length} icon={Ticket} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Revenue Split</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Cash</span>
                <span className="font-bold">₹{cashRevenue}</span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-success rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: totalRevenue ? `${(cashRevenue / totalRevenue) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Digital</span>
                <span className="font-bold">₹{digitalRevenue}</span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: totalRevenue ? `${(digitalRevenue / totalRevenue) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 rounded-lg bg-muted/20">
              <span>Cash Tickets</span>
              <span className="font-bold">{cashTickets.length}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/20">
              <span>Digital Tickets</span>
              <span className="font-bold">{digitalTickets.length}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-primary/10">
              <span className="font-semibold">Average Fare</span>
              <span className="font-bold text-primary">₹{tickets.length ? Math.round(totalRevenue / tickets.length) : 0}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
