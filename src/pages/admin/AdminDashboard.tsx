import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, AlertTriangle, Receipt, MessageSquare, Cpu } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [rerouteRequests, setRerouteRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [busRes, ticketRes, compRes, sosRes, rerouteRes, sugRes] = await Promise.all([
        supabase.from('buses').select('*, routes(route_number, route_name)').order('bus_number'),
        supabase.from('tickets').select('fare'),
        supabase.from('complaints').select('id, status'),
        supabase.from('sos_alerts').select('id, status'),
        supabase.from('reroute_requests').select('id, status'),
        supabase.from('ai_routing_suggestions').select('*').eq('is_implemented', false).order('created_at', { ascending: false }).limit(5),
      ]);
      if (busRes.data) setBuses(busRes.data);
      if (ticketRes.data) setTickets(ticketRes.data);
      if (compRes.data) setComplaints(compRes.data);
      if (sosRes.data) setSosAlerts(sosRes.data);
      if (rerouteRes.data) setRerouteRequests(rerouteRes.data);
      if (sugRes.data) setSuggestions(sugRes.data);
    };
    load();
  }, []);

  const activeBuses = buses.filter(b => b.status === 'active').length;
  const totalRevenue = tickets.reduce((s, t) => s + Number(t.fare), 0);
  const totalPassengers = tickets.length;
  const activeAlerts = sosAlerts.filter(a => a.status === 'active').length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const pendingReroutes = rerouteRequests.filter(r => r.status === 'pending').length;

  const overcrowded = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) > 0.9);
  const underutilized = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) < 0.3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Buses" value={activeBuses} icon={Bus} />
        <StatCard title="Total Passengers" value={totalPassengers} icon={Users} />
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₹" icon={Receipt} />
        <StatCard title="Active Alerts" value={activeAlerts} icon={AlertTriangle} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              AI Routing Suggestions
            </h3>
            <Badge className="badge-warning">{suggestions.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending suggestions</p>
            ) : suggestions.slice(0, 3).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex justify-between mb-2">
                  <Badge className={s.priority === 'high' ? 'badge-danger' : 'badge-warning'}>{s.priority}</Badge>
                </div>
                <p className="text-sm font-medium">{s.suggested_action}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/admin/routing')}>
              View All Suggestions →
            </Button>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Fleet Overview</h3>
          <div className="space-y-3">
            {overcrowded.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-destructive mb-2">Overcrowded ({overcrowded.length})</p>
                {overcrowded.slice(0, 2).map((bus) => (
                  <div key={bus.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-2">
                    <div className="flex justify-between">
                      <span className="font-bold">{bus.bus_number}</span>
                      <Badge className="badge-danger">{Math.round((bus.current_occupancy / bus.total_seats) * 100)}%</Badge>
                    </div>
                    {bus.routes && <p className="text-sm text-muted-foreground">{bus.routes.route_name}</p>}
                  </div>
                ))}
              </div>
            )}
            {underutilized.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-success mb-2">Underutilized ({underutilized.length})</p>
                {underutilized.slice(0, 2).map((bus) => (
                  <div key={bus.id} className="p-3 rounded-lg bg-success/10 border border-success/30 mb-2">
                    <div className="flex justify-between">
                      <span className="font-bold">{bus.bus_number}</span>
                      <Badge className="badge-success">{Math.round((bus.current_occupancy / bus.total_seats) * 100)}%</Badge>
                    </div>
                    {bus.routes && <p className="text-sm text-muted-foreground">{bus.routes.route_name}</p>}
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/admin/fleet')}>
              View Fleet Map →
            </Button>
          </div>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="cursor-pointer hover:border-warning/50 transition-colors" onClick={() => navigate('/dashboard/admin/complaints')}>
          <h4 className="font-semibold mb-2">Pending Complaints</h4>
          <p className="text-3xl font-bold text-warning">{pendingComplaints}</p>
          <Button variant="link" className="p-0 mt-2">Review →</Button>
        </GlassCard>
        <GlassCard className="cursor-pointer hover:border-destructive/50 transition-colors" onClick={() => navigate('/dashboard/admin/sos')}>
          <h4 className="font-semibold mb-2">Active SOS</h4>
          <p className="text-3xl font-bold text-destructive">{activeAlerts}</p>
          <Button variant="link" className="p-0 mt-2">Respond →</Button>
        </GlassCard>
        <GlassCard className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/dashboard/admin/routing')}>
          <h4 className="font-semibold mb-2">Reroute Requests</h4>
          <p className="text-3xl font-bold text-primary">{pendingReroutes}</p>
          <Button variant="link" className="p-0 mt-2">Process →</Button>
        </GlassCard>
      </div>
    </div>
  );
}
