import { useState, useEffect } from 'react';
import { Cpu, Bus, AlertTriangle, CheckCircle, Eye, Image, Phone, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function AdminRouting() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [rerouteRequests, setRerouteRequests] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [pendingApprovalReq, setPendingApprovalReq] = useState<any>(null);
  const [selectedEmptyBus, setSelectedEmptyBus] = useState('');
  const [aiRunning, setAiRunning] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [busRes, routeRes, sugRes, reqRes] = await Promise.all([
      supabase.from('buses').select('*, routes(route_number, route_name)').order('bus_number'),
      supabase.from('routes').select('*').eq('is_active', true),
      supabase.from('ai_routing_suggestions').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('reroute_requests').select('*').order('created_at', { ascending: false }),
    ]);
    if (busRes.data) setBuses(busRes.data);
    if (routeRes.data) setRoutes(routeRes.data);
    if (sugRes.data) setSuggestions(sugRes.data);
    if (reqRes.data) setRerouteRequests(reqRes.data);
  };

  const generateAISuggestions = async () => {
    setAiRunning(true);
    // Group buses by route
    const routeBusMap: Record<string, any[]> = {};
    buses.forEach(b => {
      if (b.route_id) {
        if (!routeBusMap[b.route_id]) routeBusMap[b.route_id] = [];
        routeBusMap[b.route_id].push(b);
      }
    });

    const newSuggestions: { routeId: string; routeName: string; busCount: number; avgOccupancy: number; busNumbers: string[] }[] = [];
    Object.entries(routeBusMap).forEach(([routeId, routeBuses]) => {
      const fullBuses = routeBuses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) >= 0.98);
      if (fullBuses.length >= 3) {
        const route = routes.find(r => r.id === routeId);
        if (route) {
          const avgOcc = Math.round(fullBuses.reduce((s, b) => s + (b.current_occupancy / b.total_seats) * 100, 0) / fullBuses.length);
          newSuggestions.push({
            routeId,
            routeName: `${route.route_number} — ${route.route_name}`,
            busCount: fullBuses.length,
            avgOccupancy: avgOcc,
            busNumbers: fullBuses.map(b => b.bus_number),
          });
        }
      }
    });

    if (newSuggestions.length === 0) {
      toast.info('No routes currently need rerouting (need 3+ buses at 98%+ occupancy on same route)');
    } else {
      for (const s of newSuggestions) {
        await supabase.from('ai_routing_suggestions').insert({
          suggestion_type: 'reroute',
          priority: 'high',
          suggested_action: `Route ${s.routeName} requires additional bus — ${s.busCount} buses at ${s.avgOccupancy}% average occupancy`,
          reason: `Buses ${s.busNumbers.join(', ')} on route ${s.routeName} have ≥98% occupancy including standing. Passengers are overcrowded.`,
          route_id: s.routeId,
          affected_buses: s.busNumbers,
        });
      }
      toast.success(`Generated ${newSuggestions.length} AI rerouting suggestion(s)`);
      await loadData();
    }
    setAiRunning(false);
  };

  const overcrowded = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) >= 0.98);
  const full = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) >= 0.9 && (b.current_occupancy / b.total_seats) < 0.98);
  const underutilized = buses.filter(b => b.total_seats && (b.current_occupancy / b.total_seats) < 0.3 && b.current_occupancy > 0);
  const emptyBuses = buses.filter(b => b.current_occupancy === 0);

  const handleReassign = async () => {
    if (!selectedBus || !selectedRoute) return;
    const bus = buses.find(b => b.id === selectedBus);
    const route = routes.find(r => r.id === selectedRoute);

    const { error } = await supabase.from('buses').update({ route_id: selectedRoute }).eq('id', selectedBus);
    if (error) { toast.error('Failed to reassign'); return; }

    if (bus?.driver_id) {
      await supabase.from('notifications').insert({
        user_id: bus.driver_id, title: 'Route Changed',
        message: `Your bus ${bus.bus_number} has been reassigned to route ${route?.route_number} — ${route?.route_name}`, type: 'warning',
      });
    }
    if (bus?.conductor_id) {
      await supabase.from('notifications').insert({
        user_id: bus.conductor_id, title: 'Route Changed',
        message: `Bus ${bus.bus_number} has been reassigned to route ${route?.route_number} — ${route?.route_name}`, type: 'warning',
      });
    }

    toast.success('Bus reassigned! Driver & Conductor notified.');
    setSelectedBus(''); setSelectedRoute('');
    loadData();
  };

  const implementSuggestion = async (id: string) => {
    await supabase.from('ai_routing_suggestions').update({ is_implemented: true, implemented_at: new Date().toISOString(), implemented_by: user?.id }).eq('id', id);
    toast.success('Suggestion marked as implemented');
    loadData();
  };

  // Enhanced: When admin clicks "Approve", open dialog to pick empty bus
  const startApproval = (req: any) => {
    setPendingApprovalReq(req);
    setSelectedEmptyBus('');
    setApproveDialogOpen(true);
  };

  const confirmApproval = async () => {
    if (!pendingApprovalReq) return;
    const req = pendingApprovalReq;

    // Update request status
    await supabase.from('reroute_requests').update({
      status: 'approved', reviewed_by: user?.id, reviewed_at: new Date().toISOString(), admin_notes: reviewNotes,
    }).eq('id', req.id);

    // If admin selected an empty bus, reassign it to the overcrowded route
    if (selectedEmptyBus) {
      const emptyBus = buses.find(b => b.id === selectedEmptyBus);
      const matchedBus = buses.find(b => b.bus_number === req.bus_number);
      const targetRouteId = matchedBus?.route_id || req.route_id;

      if (targetRouteId) {
        await supabase.from('buses').update({ route_id: targetRouteId }).eq('id', selectedEmptyBus);
        const route = routes.find(r => r.id === targetRouteId);

        // Notify empty bus driver/conductor
        if (emptyBus?.driver_id) {
          await supabase.from('notifications').insert({
            user_id: emptyBus.driver_id, title: 'New Route Assignment',
            message: `Your bus ${emptyBus.bus_number} has been assigned to route ${route?.route_number} — ${route?.route_name} to relieve overcrowding.`,
            type: 'warning',
          });
        }
        if (emptyBus?.conductor_id) {
          await supabase.from('notifications').insert({
            user_id: emptyBus.conductor_id, title: 'New Route Assignment',
            message: `Bus ${emptyBus.bus_number} has been assigned to route ${route?.route_number} — ${route?.route_name}.`,
            type: 'warning',
          });
        }
      }
    }

    // Notify passenger
    if (req.requested_by) {
      await supabase.from('notifications').insert({
        user_id: req.requested_by, title: 'Reroute Request Approved ✅',
        message: `Your reroute request for bus ${req.bus_number} has been approved! ${selectedEmptyBus ? 'An additional bus is being dispatched to the route.' : 'The route will be updated shortly.'}`,
        type: 'success',
      });
    }

    toast.success('Request approved & bus dispatched!');
    setApproveDialogOpen(false);
    setPendingApprovalReq(null);
    setReviewNotes('');
    setSelectedEmptyBus('');
    loadData();
  };

  const handleReject = async (requestId: string) => {
    const req = rerouteRequests.find(r => r.id === requestId);
    await supabase.from('reroute_requests').update({
      status: 'rejected', reviewed_by: user?.id, reviewed_at: new Date().toISOString(), admin_notes: reviewNotes,
    }).eq('id', requestId);

    if (req?.requested_by) {
      await supabase.from('notifications').insert({
        user_id: req.requested_by, title: 'Reroute Request Rejected',
        message: `Your reroute request for bus ${req.bus_number} has been rejected. ${reviewNotes || ''}`,
        type: 'warning',
      });
    }

    toast.success('Request rejected');
    setReviewNotes('');
    loadData();
  };

  const BusCard = ({ bus, type }: { bus: any; type: 'overcrowded' | 'full' | 'underutilized' | 'empty' }) => {
    const pct = bus.total_seats ? Math.round((bus.current_occupancy / bus.total_seats) * 100) : 0;
    const colors = {
      overcrowded: 'bg-destructive/10 border-destructive/30',
      full: 'bg-warning/10 border-warning/30',
      underutilized: 'bg-success/10 border-success/30',
      empty: 'bg-muted/20 border-muted/30',
    };
    const badgeClass = {
      overcrowded: 'bg-destructive text-destructive-foreground',
      full: 'bg-warning text-warning-foreground',
      underutilized: 'bg-primary/20 text-primary',
      empty: 'bg-muted text-muted-foreground',
    };
    return (
      <div className={`p-3 rounded-lg border ${colors[type]}`}>
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground">{bus.bus_number}</span>
          <Badge className={badgeClass[type]}>{pct}%</Badge>
        </div>
        {bus.routes && <p className="text-sm text-muted-foreground">{bus.routes.route_number} — {bus.routes.route_name}</p>}
        {!bus.routes && !bus.route_id && <p className="text-sm text-muted-foreground italic">No route assigned</p>}
        <p className="text-xs text-muted-foreground mt-1">{bus.current_occupancy}/{bus.total_seats} seats</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-2xl font-bold">AI Routing Panel</h2>
        <Button onClick={generateAISuggestions} className="btn-glow" disabled={aiRunning}>
          {aiRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Cpu className="h-4 w-4 mr-2" />}
          Run AI Analysis
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
          <p className="text-2xl font-bold text-destructive">{overcrowded.length}</p>
          <p className="text-sm text-muted-foreground">Overcrowded ≥98%</p>
        </div>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 text-center">
          <p className="text-2xl font-bold text-warning">{full.length}</p>
          <p className="text-sm text-muted-foreground">Full 90-97%</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
          <p className="text-2xl font-bold text-primary">{underutilized.length}</p>
          <p className="text-sm text-muted-foreground">Underutilized &lt;30%</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 border border-muted text-center">
          <p className="text-2xl font-bold text-muted-foreground">{emptyBuses.length}</p>
          <p className="text-sm text-muted-foreground">Empty / Unassigned</p>
        </div>
      </div>

      <Tabs defaultValue="fleet">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
          <TabsTrigger value="requests">
            Reroute Requests
            {rerouteRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground">{rerouteRequests.filter(r => r.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reassign">Reassign Route</TabsTrigger>
        </TabsList>

        {/* Fleet Status Tab */}
        <TabsContent value="fleet" className="space-y-4">
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <GlassCard>
              <h3 className="font-display text-lg font-bold mb-3 text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />Overcrowded ≥98% ({overcrowded.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {overcrowded.length === 0 ? <p className="text-muted-foreground text-sm">No overcrowded buses</p>
                  : overcrowded.map(b => <BusCard key={b.id} bus={b} type="overcrowded" />)}
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-display text-lg font-bold mb-3 text-warning flex items-center gap-2">
                <Bus className="h-5 w-5" />Full 90-97% ({full.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {full.length === 0 ? <p className="text-muted-foreground text-sm">No full buses</p>
                  : full.map(b => <BusCard key={b.id} bus={b} type="full" />)}
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-display text-lg font-bold mb-3 text-primary flex items-center gap-2">
                <Bus className="h-5 w-5" />Underutilized &lt;30% ({underutilized.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {underutilized.length === 0 ? <p className="text-muted-foreground text-sm">No underutilized buses</p>
                  : underutilized.map(b => <BusCard key={b.id} bus={b} type="underutilized" />)}
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-display text-lg font-bold mb-3 text-muted-foreground flex items-center gap-2">
                <Bus className="h-5 w-5" />Empty ({emptyBuses.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {emptyBuses.length === 0 ? <p className="text-muted-foreground text-sm">No empty buses</p>
                  : emptyBuses.map(b => <BusCard key={b.id} bus={b} type="empty" />)}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai" className="space-y-4">
          <GlassCard glow>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />AI Rerouting Suggestions
              </h3>
              <p className="text-sm text-muted-foreground">Triggers when 3+ buses on same route ≥98% full</p>
            </div>

            {/* Example hint */}
            {suggestions.length === 0 && (
              <div className="p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5 mb-4">
                <p className="text-sm font-medium text-primary mb-1">💡 How AI Analysis works:</p>
                <p className="text-sm text-muted-foreground">
                  Click <strong>"Run AI Analysis"</strong> above. The system scans all routes. If 3 or more buses on the same route have ≥98% occupancy (including standing),
                  it generates a suggestion like: <em>"Route 21G — T. Nagar → Broadway requires additional bus — 3 buses at 99% average occupancy"</em>.
                  You can then mark it as implemented and reassign an empty bus.
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {suggestions.map((s) => (
                <div key={s.id} className={`p-4 rounded-lg border ${s.is_implemented ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/30'}`}>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={s.priority === 'high' ? 'bg-destructive text-destructive-foreground' : 'bg-primary/20 text-primary'}>{s.priority}</Badge>
                      <Badge variant="outline">{s.suggestion_type}</Badge>
                    </div>
                    {s.is_implemented && <Badge className="bg-primary/20 text-primary">✓ Implemented</Badge>}
                  </div>
                  <p className="font-medium text-foreground">{s.suggested_action}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.reason}</p>
                  {s.affected_buses && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {s.affected_buses.map((bn: string) => <Badge key={bn} variant="outline" className="text-xs">{bn}</Badge>)}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{new Date(s.created_at).toLocaleString()}</p>
                  {!s.is_implemented && (
                    <Button size="sm" className="mt-3" onClick={() => implementSuggestion(s.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Mark Implemented
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        {/* Reroute Requests Tab — with enhanced approval flow */}
        <TabsContent value="requests" className="space-y-4">
          <GlassCard>
            <h3 className="font-display text-lg font-bold mb-4">Reroute Requests from Passengers / Drivers / Conductors</h3>
            <div className="space-y-3">
              {rerouteRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reroute requests</p>
              ) : rerouteRequests.map((req) => (
                <div key={req.id} className={`p-4 rounded-lg border ${
                  req.status === 'pending' ? 'bg-warning/10 border-warning/30' :
                  req.status === 'approved' ? 'bg-primary/5 border-primary/20' :
                  req.status === 'rejected' ? 'bg-destructive/10 border-destructive/30' :
                  'bg-muted/10 border-muted/30'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-foreground">Bus: {req.bus_number}</span>
                        <Badge className={
                          req.status === 'pending' ? 'bg-warning text-warning-foreground' :
                          req.status === 'approved' ? 'bg-primary/20 text-primary' :
                          'bg-destructive text-destructive-foreground'
                        }>{req.status}</Badge>
                      </div>
                      <p className="text-muted-foreground">{req.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(req.created_at).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* View proof image */}
                      {req.proof_image_url && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline"><Image className="h-4 w-4 mr-1" />Proof</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Passenger Proof Image</DialogTitle></DialogHeader>
                            <img src={req.proof_image_url} alt="Proof" className="w-full rounded-lg" />
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Cross-check */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />Cross-Check</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader><DialogTitle>Cross-Check Bus {req.bus_number}</DialogTitle></DialogHeader>
                          <CrossCheckContent buses={buses} req={req} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Admin action for pending requests */}
                  {req.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <Textarea
                        placeholder="Admin notes (optional)..."
                        value={selectedRequest?.id === req.id ? reviewNotes : ''}
                        onChange={(e) => { setSelectedRequest(req); setReviewNotes(e.target.value); }}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => startApproval(req)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <CheckCircle className="h-4 w-4 mr-1" />Approve & Assign Bus
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        {/* Reassign Route Tab */}
        <TabsContent value="reassign">
          <GlassCard>
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />Route Reassignment
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a bus and assign it to a new route. Driver, conductor, and passengers will be notified.
            </p>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Select Bus</Label>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger><SelectValue placeholder="Choose bus..." /></SelectTrigger>
                  <SelectContent>
                    {buses.map((b) => {
                      const pct = b.total_seats ? Math.round((b.current_occupancy / b.total_seats) * 100) : 0;
                      return <SelectItem key={b.id} value={b.id}>{b.bus_number} ({pct}% occupied)</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign to Route</Label>
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger><SelectValue placeholder="Choose route..." /></SelectTrigger>
                  <SelectContent>
                    {routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.route_number} — {r.route_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="btn-glow" onClick={handleReassign} disabled={!selectedBus || !selectedRoute}>
                <ArrowRight className="h-4 w-4 mr-1" />Reassign Route
              </Button>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Approve & Assign Empty Bus Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve & Dispatch Bus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Approving reroute request for <strong>{pendingApprovalReq?.bus_number}</strong>. Select an empty/unassigned bus to dispatch to this overcrowded route:
            </p>

            {emptyBuses.length === 0 && underutilized.length === 0 ? (
              <p className="text-sm text-destructive">No empty or underutilized buses available. You can still approve the request.</p>
            ) : (
              <div className="space-y-2">
                <Label>Select Bus to Dispatch</Label>
                <Select value={selectedEmptyBus} onValueChange={setSelectedEmptyBus}>
                  <SelectTrigger><SelectValue placeholder="Choose an available bus..." /></SelectTrigger>
                  <SelectContent>
                    {emptyBuses.map(b => (
                      <SelectItem key={b.id} value={b.id}>
                        🟢 {b.bus_number} — Empty {b.routes ? `(on ${b.routes.route_number})` : '(Unassigned)'}
                      </SelectItem>
                    ))}
                    {underutilized.map(b => {
                      const pct = Math.round((b.current_occupancy / b.total_seats) * 100);
                      return (
                        <SelectItem key={b.id} value={b.id}>
                          🔵 {b.bus_number} — {pct}% {b.routes ? `(on ${b.routes.route_number})` : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedEmptyBus && (() => {
              const bus = buses.find(b => b.id === selectedEmptyBus);
              const matchedBus = buses.find(b => b.bus_number === pendingApprovalReq?.bus_number);
              const targetRoute = matchedBus?.routes;
              return bus ? (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-foreground">
                    Bus <strong>{bus.bus_number}</strong> will be dispatched to route{' '}
                    <strong>{targetRoute ? `${targetRoute.route_number} — ${targetRoute.route_name}` : 'same route'}</strong>
                  </p>
                </div>
              ) : null;
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmApproval} className="bg-primary text-primary-foreground">
              <CheckCircle className="h-4 w-4 mr-1" />
              {selectedEmptyBus ? 'Approve & Dispatch' : 'Approve Only'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Cross-check component
function CrossCheckContent({ buses, req }: { buses: any[]; req: any }) {
  const matchedBus = buses.find(b => b.bus_number === req.bus_number);
  if (!matchedBus) return <p className="text-muted-foreground">Bus not found in system</p>;
  const pct = matchedBus.total_seats ? Math.round((matchedBus.current_occupancy / matchedBus.total_seats) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">Occupancy</p>
          <p className="text-xl font-bold text-foreground">{pct}%</p>
          <p className="text-xs text-muted-foreground">{matchedBus.current_occupancy}/{matchedBus.total_seats}</p>
        </div>
        <div className="p-3 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-xl font-bold capitalize text-foreground">{matchedBus.status}</p>
        </div>
      </div>
      {matchedBus.routes && (
        <div className="p-3 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">Current Route</p>
          <p className="font-medium text-foreground">{matchedBus.routes.route_number} — {matchedBus.routes.route_name}</p>
        </div>
      )}
      <div className="p-3 bg-primary/10 rounded-lg">
        <p className="text-sm font-semibold mb-1 text-foreground">Conductor Contact</p>
        <p className="text-sm text-muted-foreground">
          {matchedBus.conductor_id ? `Conductor ID: ${matchedBus.conductor_id.slice(0, 8)}...` : 'No conductor assigned'}
        </p>
        {matchedBus.conductor_id && (
          <Button size="sm" variant="outline" className="mt-2" onClick={async () => {
            await supabase.from('notifications').insert({
              user_id: matchedBus.conductor_id,
              title: 'Verification Request',
              message: `Admin is cross-checking bus ${matchedBus.bus_number}. Please confirm current passenger load.`,
              type: 'warning',
            });
            toast.success('Verification request sent to conductor');
          }}>
            <Phone className="h-4 w-4 mr-1" />Contact Conductor
          </Button>
        )}
      </div>
    </div>
  );
}
