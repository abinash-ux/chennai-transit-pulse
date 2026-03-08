import { useState, useEffect } from 'react';
import { Cpu, Bus, AlertTriangle, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminRouting() {
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [busRes, routeRes, sugRes] = await Promise.all([
      supabase.from('buses').select('*, routes(route_number, route_name)').order('bus_number'),
      supabase.from('routes').select('*').eq('is_active', true),
      supabase.from('ai_routing_suggestions').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    if (busRes.data) setBuses(busRes.data);
    if (routeRes.data) setRoutes(routeRes.data);
    if (sugRes.data) setSuggestions(sugRes.data);
  };

  const overcrowded = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) > 0.9);
  const underutilized = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) < 0.3);

  const handleReassign = async () => {
    if (!selectedBus || !selectedRoute) return;
    const { error } = await supabase
      .from('buses')
      .update({ route_id: selectedRoute })
      .eq('id', selectedBus);
    if (error) {
      toast.error('Failed to reassign');
    } else {
      toast.success('Bus reassigned successfully!');
      setSelectedBus('');
      setSelectedRoute('');
      loadData();
    }
  };

  const implementSuggestion = async (id: string) => {
    const { error } = await supabase
      .from('ai_routing_suggestions')
      .update({ is_implemented: true, implemented_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      toast.success('Suggestion implemented!');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">AI Routing Panel</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4 text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />Overcrowded ({overcrowded.length})
          </h3>
          <div className="space-y-2">
            {overcrowded.length === 0 ? (
              <p className="text-muted-foreground text-sm">No overcrowded buses</p>
            ) : overcrowded.map((bus) => (
              <div key={bus.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex justify-between">
                  <span className="font-bold">{bus.bus_number}</span>
                  <Badge className="badge-danger">{Math.round((bus.current_occupancy / bus.total_seats) * 100)}%</Badge>
                </div>
                {(bus as any).routes && <p className="text-sm text-muted-foreground">{(bus as any).routes.route_name}</p>}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4 text-success flex items-center gap-2">
            <Bus className="h-5 w-5" />Underutilized ({underutilized.length})
          </h3>
          <div className="space-y-2">
            {underutilized.length === 0 ? (
              <p className="text-muted-foreground text-sm">No underutilized buses</p>
            ) : underutilized.map((bus) => (
              <div key={bus.id} className="p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="flex justify-between">
                  <span className="font-bold">{bus.bus_number}</span>
                  <Badge className="badge-success">{Math.round((bus.current_occupancy / bus.total_seats) * 100)}%</Badge>
                </div>
                {(bus as any).routes && <p className="text-sm text-muted-foreground">{(bus as any).routes.route_name}</p>}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard glow>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />AI Suggestions
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {suggestions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No suggestions yet</p>
            ) : suggestions.map((s) => (
              <div key={s.id} className={`p-3 rounded-lg border ${s.is_implemented ? 'bg-success/10 border-success/30' : 'bg-primary/10 border-primary/30'}`}>
                <div className="flex justify-between mb-1">
                  <Badge className={s.priority === 'high' ? 'badge-danger' : s.priority === 'medium' ? 'badge-warning' : 'badge-info'}>{s.priority}</Badge>
                  {s.is_implemented && <Badge className="badge-success">Done</Badge>}
                </div>
                <p className="text-sm font-medium">{s.suggested_action}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                {!s.is_implemented && (
                  <Button size="sm" className="mt-2" onClick={() => implementSuggestion(s.id)}>Apply</Button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-display text-lg font-bold mb-4">Route Reassignment</h3>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Select Bus</Label>
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger><SelectValue placeholder="Choose bus..." /></SelectTrigger>
              <SelectContent>
                {buses.map((b) => <SelectItem key={b.id} value={b.id}>{b.bus_number}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assign to Route</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger><SelectValue placeholder="Choose route..." /></SelectTrigger>
              <SelectContent>
                {routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.route_number} - {r.route_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="btn-glow" onClick={handleReassign} disabled={!selectedBus || !selectedRoute}>
            Reassign Route
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
