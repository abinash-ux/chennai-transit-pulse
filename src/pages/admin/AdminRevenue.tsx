import { useState, useEffect } from 'react';
import { Receipt, Ticket, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--warning))'];

export default function AdminRevenue() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('tickets').select('fare, payment_method, issued_at'),
      supabase.from('fines').select('amount, status, created_at'),
      supabase.from('monthly_passes').select('price, pass_type, created_at'),
    ]).then(([t, f, p]) => {
      if (t.data) setTickets(t.data);
      if (f.data) setFines(f.data);
      if (p.data) setPasses(p.data);
    });
  }, []);

  const ticketRevenue = tickets.reduce((s, t) => s + Number(t.fare), 0);
  const fineRevenuePaid = fines.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0);
  const finePending = fines.filter(f => f.status !== 'paid').reduce((s, f) => s + Number(f.amount), 0);
  const passRevenue = passes.reduce((s, p) => s + Number(p.price), 0);
  const totalRevenue = ticketRevenue + fineRevenuePaid + passRevenue;
  const cashTickets = tickets.filter(t => t.payment_method === 'cash');
  const digitalTickets = tickets.filter(t => t.payment_method === 'digital');
  const cashRevenue = cashTickets.reduce((s, t) => s + Number(t.fare), 0);
  const digitalRevenue = digitalTickets.reduce((s, t) => s + Number(t.fare), 0);

  const pieData = [
    { name: 'Ticket Revenue', value: ticketRevenue },
    { name: 'Pass Revenue', value: passRevenue },
    { name: 'Fine Revenue (Paid)', value: fineRevenuePaid },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Cash Tickets', revenue: cashRevenue, count: cashTickets.length },
    { name: 'Digital Tickets', revenue: digitalRevenue, count: digitalTickets.length },
    { name: 'Monthly Passes', revenue: passRevenue, count: passes.length },
    { name: 'Fines (Paid)', revenue: fineRevenuePaid, count: fines.filter(f => f.status === 'paid').length },
    { name: 'Fines (Pending)', revenue: finePending, count: fines.filter(f => f.status !== 'paid').length },
  ];

  // Group passes by type
  const passTypes: Record<string, { count: number; revenue: number }> = {};
  passes.forEach(p => {
    if (!passTypes[p.pass_type]) passTypes[p.pass_type] = { count: 0, revenue: 0 };
    passTypes[p.pass_type].count++;
    passTypes[p.pass_type].revenue += Number(p.price);
  });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Revenue Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₹" icon={Receipt} />
        <StatCard title="Ticket Revenue" value={ticketRevenue} prefix="₹" icon={Ticket} />
        <StatCard title="Pass Revenue" value={passRevenue} prefix="₹" icon={CreditCard} />
        <StatCard title="Fine Revenue (Paid)" value={fineRevenuePaid} prefix="₹" icon={AlertTriangle} />
        <StatCard title="Fine Pending" value={finePending} prefix="₹" icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown Pie Chart */}
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Revenue Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}>
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No revenue data yet</p>
          )}
        </GlassCard>

        {/* Revenue Bar Chart */}
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue (₹)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="count" name="Count" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Ticket Breakdown */}
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Tickets</h3>
          <p className="text-4xl font-display font-bold text-primary">₹{ticketRevenue.toLocaleString()}</p>
          <p className="text-muted-foreground mt-1">{tickets.length} tickets sold</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">💵 Cash</span>
              <span className="font-medium">{cashTickets.length} tickets — ₹{cashRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">💳 Digital</span>
              <span className="font-medium">{digitalTickets.length} tickets — ₹{digitalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </GlassCard>

        {/* Pass Breakdown */}
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Monthly Passes</h3>
          <p className="text-4xl font-display font-bold text-success">₹{passRevenue.toLocaleString()}</p>
          <p className="text-muted-foreground mt-1">{passes.length} passes purchased</p>
          <div className="mt-4 space-y-2">
            {Object.entries(passTypes).map(([type, data]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium">{data.count} — ₹{data.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Fine Breakdown */}
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Fines</h3>
          <p className="text-4xl font-display font-bold text-destructive">₹{fineRevenuePaid.toLocaleString()}</p>
          <p className="text-muted-foreground mt-1">
            {fines.filter(f => f.status === 'paid').length} paid / {fines.length} total
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">✅ Paid</span>
              <span className="font-medium text-success">₹{fineRevenuePaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">⏳ Pending</span>
              <span className="font-medium text-warning">₹{finePending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">⚠️ Overdue</span>
              <span className="font-medium text-destructive">{fines.filter(f => f.status === 'overdue').length} fines</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
