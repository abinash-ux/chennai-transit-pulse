import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, AlertTriangle, Receipt, MessageSquare, Cpu, Shield, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  const [fines, setFines] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [busRes, ticketRes, compRes, sosRes, rerouteRes, sugRes, fineRes, passRes, profileRes] = await Promise.all([
        supabase.from('buses').select('*, routes(route_number, route_name)').order('bus_number'),
        supabase.from('tickets').select('fare, payment_method'),
        supabase.from('complaints').select('id, status'),
        supabase.from('sos_alerts').select('id, status, sos_type, reporter_role, created_at'),
        supabase.from('reroute_requests').select('id, status'),
        supabase.from('ai_routing_suggestions').select('*').eq('is_implemented', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('fines').select('amount, status'),
        supabase.from('monthly_passes').select('price'),
        supabase.from('profiles').select('id'),
      ]);
      if (busRes.data) setBuses(busRes.data);
      if (ticketRes.data) setTickets(ticketRes.data);
      if (compRes.data) setComplaints(compRes.data);
      if (sosRes.data) setSosAlerts(sosRes.data);
      if (rerouteRes.data) setRerouteRequests(rerouteRes.data);
      if (sugRes.data) setSuggestions(sugRes.data);
      if (fineRes.data) setFines(fineRes.data);
      if (passRes.data) setPasses(passRes.data);
      if (profileRes.data) setProfiles(profileRes.data);
    };
    load();
  }, []);

  const activeBuses = buses.filter(b => b.status === 'active').length;
  const ticketRevenue = tickets.reduce((s, t) => s + Number(t.fare), 0);
  const fineRevenue = fines.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0);
  const passRevenue = passes.reduce((s, p) => s + Number(p.price), 0);
  const totalRevenue = ticketRevenue + fineRevenue + passRevenue;
  const totalPassengers = tickets.length;
  const activeAlerts = sosAlerts.filter(a => a.status === 'active').length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const pendingReroutes = rerouteRequests.filter(r => r.status === 'pending').length;
  const TOTAL_CAPACITY = 70;
  const overcrowded = buses.filter(b => (b.current_occupancy / TOTAL_CAPACITY) > 0.9);
  const underutilized = buses.filter(b => (b.current_occupancy / TOTAL_CAPACITY) < 0.3);

  const QuickAction = ({ title, value, color, icon: Icon, onClick, subtitle }: any) => (
    <GlassCard className="cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02]" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-${color.replace('text-', '')}/10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <Button variant="link" className="p-0 mt-2 text-xs">View Details →</Button>
    </GlassCard>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Active Buses" value={activeBuses} icon={Bus} />
        <StatCard title="Total Users" value={profiles.length} icon={Users} />
        <StatCard title="Passengers Today" value={totalPassengers} icon={Users} />
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₹" icon={Receipt} />
        <StatCard title="Active Alerts" value={activeAlerts} icon={AlertTriangle} />
        <StatCard title="AI Suggestions" value={suggestions.length} icon={Cpu} />
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction title="Pending Complaints" value={pendingComplaints} color="text-warning" icon={MessageSquare}
          onClick={() => navigate('/dashboard/admin/complaints')} subtitle="Click to review" />
        <QuickAction title="Active SOS" value={activeAlerts} color="text-destructive" icon={AlertTriangle}
          onClick={() => navigate('/dashboard/admin/sos')} subtitle="Requires immediate action" />
        <QuickAction title="Reroute Requests" value={pendingReroutes} color="text-primary" icon={MapPin}
          onClick={() => navigate('/dashboard/admin/routing')} subtitle="From passengers & staff" />
        <QuickAction title="Fine Revenue" value={`₹${fineRevenue.toLocaleString()}`} color="text-success" icon={TrendingUp}
          onClick={() => navigate('/dashboard/admin/revenue')} subtitle={`${fines.filter(f => f.status === 'paid').length} fines collected`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Suggestions */}
        <GlassCard glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />AI Routing Suggestions
            </h3>
            <Badge className="badge-warning">{suggestions.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending suggestions</p>
            ) : suggestions.slice(0, 3).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => navigate('/dashboard/admin/routing')}>
                <div className="flex justify-between mb-2">
                  <Badge className={s.priority === 'high' ? 'badge-danger' : 'badge-warning'}>{s.priority}</Badge>
                </div>
                <p className="text-sm font-medium">{s.suggested_action}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/admin/routing')}>
              <Cpu className="h-4 w-4 mr-2" />Open AI Routing Panel →
            </Button>
          </div>
        </GlassCard>

        {/* Fleet Overview */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Fleet Overview</h3>
            <Badge>{buses.length} Buses</Badge>
          </div>
          <div className="space-y-3">
            {overcrowded.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-destructive mb-2">🔴 Overcrowded ({overcrowded.length})</p>
                {overcrowded.slice(0, 3).map((bus) => {
                  const pct = Math.round((bus.current_occupancy / TOTAL_CAPACITY) * 100);
                    return (
                    <div key={bus.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-2 cursor-pointer hover:bg-destructive/20 transition-colors"
                      onClick={() => navigate('/dashboard/admin/fleet')}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{bus.bus_number}</span>
                        <Badge className="badge-danger">{pct}%</Badge>
                      </div>
                      {bus.routes && <p className="text-sm text-muted-foreground">{bus.routes.route_name}</p>}
                      <Progress value={pct} className="h-1.5 mt-2" />
                    </div>
                  );
                })}
              </div>
            )}
            {underutilized.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-success mb-2">🟢 Underutilized ({underutilized.length})</p>
                {underutilized.slice(0, 3).map((bus) => {
                  const pct = Math.round((bus.current_occupancy / TOTAL_CAPACITY) * 100);
                    return (
                    <div key={bus.id} className="p-3 rounded-lg bg-success/10 border border-success/30 mb-2 cursor-pointer hover:bg-success/20 transition-colors"
                      onClick={() => navigate('/dashboard/admin/fleet')}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{bus.bus_number}</span>
                        <Badge className="badge-success">{pct}%</Badge>
                      </div>
                      {bus.routes && <p className="text-sm text-muted-foreground">{bus.routes.route_name}</p>}
                      <Progress value={pct} className="h-1.5 mt-2" />
                    </div>
                  );
                })}
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/admin/fleet')}>
              <Bus className="h-4 w-4 mr-2" />Open Fleet Map →
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Revenue Quick View */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">Revenue Summary</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/revenue')}>
            View Full Analytics →
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-center cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigate('/dashboard/admin/revenue')}>
            <p className="text-2xl font-bold text-primary">₹{ticketRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">🎫 Tickets ({tickets.length})</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg text-center cursor-pointer hover:bg-success/20 transition-colors" onClick={() => navigate('/dashboard/admin/revenue')}>
            <p className="text-2xl font-bold text-success">₹{passRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">🎟️ Passes ({passes.length})</p>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg text-center cursor-pointer hover:bg-destructive/20 transition-colors" onClick={() => navigate('/dashboard/admin/revenue')}>
            <p className="text-2xl font-bold text-destructive">₹{fineRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">⚖️ Fines Collected</p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg text-center cursor-pointer hover:bg-warning/20 transition-colors" onClick={() => navigate('/dashboard/admin/revenue')}>
            <p className="text-2xl font-bold text-warning">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">💰 Total Revenue</p>
          </div>
        </div>
      </GlassCard>

      {/* Recent SOS */}
      {sosAlerts.filter(a => a.status === 'active').length > 0 && (
        <GlassCard glow className="border-destructive/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-destructive flex items-center gap-2">
              <Shield className="h-5 w-5" />Active Emergency Alerts
            </h3>
            <Badge className="badge-danger animate-pulse">{activeAlerts} Active</Badge>
          </div>
          <div className="space-y-2">
            {sosAlerts.filter(a => a.status === 'active').slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-between cursor-pointer hover:bg-destructive/20 transition-colors"
                onClick={() => navigate('/dashboard/admin/sos')}>
                <div>
                  <span className="font-bold capitalize">{alert.sos_type.replace('_', ' ')}</span>
                  <Badge variant="outline" className="ml-2 capitalize text-xs">{alert.reporter_role}</Badge>
                  <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
                <Button size="sm" variant="destructive">Respond</Button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
