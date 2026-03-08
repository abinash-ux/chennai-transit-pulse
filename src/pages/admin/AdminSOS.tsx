import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Shield, Phone, MapPin } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminSOS() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [alertRes, profRes, busRes] = await Promise.all([
      supabase.from('sos_alerts').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, full_name, email'),
      supabase.from('buses').select('id, bus_number, route_id, routes(route_number, route_name)'),
    ]);
    if (alertRes.data) setAlerts(alertRes.data);
    if (profRes.data) setProfiles(profRes.data);
    if (busRes.data) setBuses(busRes.data);
  };

  const getReporter = (userId: string) => profiles.find(p => p.user_id === userId);
  const getBus = (busId: string) => buses.find(b => b.id === busId);

  const acknowledge = async (id: string, reportedBy: string) => {
    if (!user) return;
    await supabase.from('sos_alerts').update({
      status: 'acknowledged' as const,
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    }).eq('id', id);
    await supabase.from('notifications').insert({
      user_id: reportedBy,
      title: 'SOS Alert Acknowledged',
      message: 'Your SOS alert has been acknowledged by admin. Help is on the way.',
      type: 'info',
    });
    toast.success('Alert acknowledged & reporter notified');
    loadData();
  };

  const resolve = async (id: string, reportedBy: string) => {
    if (!user) return;
    await supabase.from('sos_alerts').update({
      status: 'resolved' as const,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes || null,
    }).eq('id', id);
    await supabase.from('notifications').insert({
      user_id: reportedBy,
      title: 'SOS Alert Resolved',
      message: resolutionNotes || 'Your SOS alert has been resolved.',
      type: 'success',
    });
    toast.success('Alert resolved & reporter notified');
    setResolutionNotes('');
    loadData();
  };

  const active = alerts.filter(a => a.status === 'active');
  const acknowledged = alerts.filter(a => a.status === 'acknowledged');
  const resolved = alerts.filter(a => a.status === 'resolved');

  const AlertCard = ({ alert }: { alert: any }) => {
    const reporter = getReporter(alert.reported_by);
    const bus = alert.bus_id ? getBus(alert.bus_id) : null;
    return (
      <GlassCard glow={alert.status === 'active'} className={alert.status === 'active' ? 'border-destructive/50' : ''}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <AlertTriangle className={`h-5 w-5 ${alert.status === 'active' ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
              <span className="font-bold capitalize">{alert.sos_type.replace('_', ' ')}</span>
              <Badge className={
                alert.status === 'active' ? 'badge-danger' :
                alert.status === 'acknowledged' ? 'badge-warning' : 'badge-success'
              }>{alert.status}</Badge>
              <Badge variant="outline" className="capitalize">{alert.reporter_role}</Badge>
            </div>
            {alert.description && <p className="text-muted-foreground">{alert.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              {reporter && <span>👤 {reporter.full_name} ({reporter.email})</span>}
              {bus && <span>🚌 {bus.bus_number} {(bus as any).routes ? `— ${(bus as any).routes.route_number}` : ''}</span>}
              <span>📅 {new Date(alert.created_at).toLocaleString()}</span>
            </div>
            {alert.resolution_notes && (
              <div className="mt-2 p-2 rounded bg-success/10 text-sm">
                <span className="font-medium">Resolution: </span>{alert.resolution_notes}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {alert.status === 'active' && (
              <Button size="sm" variant="outline" onClick={() => acknowledge(alert.id, alert.reported_by)}>
                Acknowledge
              </Button>
            )}
            {(alert.status === 'active' || alert.status === 'acknowledged') && (
              <>
                <Textarea
                  placeholder="Resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="text-xs min-h-[60px] w-40"
                />
                <Button size="sm" onClick={() => resolve(alert.id, alert.reported_by)}>
                  <CheckCircle className="h-4 w-4 mr-1" />Resolve
                </Button>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">SOS Control Center</h2>
        <Badge className={active.length > 0 ? 'badge-danger animate-pulse' : 'badge-success'}>
          {active.length > 0 ? `${active.length} Active` : 'All Clear'}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="text-center py-3">
          <p className="text-3xl font-bold text-destructive">{active.length}</p>
          <p className="text-muted-foreground">Active Alerts</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-3xl font-bold text-warning">{acknowledged.length}</p>
          <p className="text-muted-foreground">Acknowledged</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-3xl font-bold text-success">{resolved.length}</p>
          <p className="text-muted-foreground">Resolved</p>
        </GlassCard>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged ({acknowledged.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
          <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="space-y-3">
            {active.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No active SOS alerts ✅</p></GlassCard> :
              active.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </TabsContent>
        <TabsContent value="acknowledged">
          <div className="space-y-3">
            {acknowledged.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No acknowledged alerts</p></GlassCard> :
              acknowledged.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </TabsContent>
        <TabsContent value="resolved">
          <div className="space-y-3">
            {resolved.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No resolved alerts</p></GlassCard> :
              resolved.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </TabsContent>
        <TabsContent value="all">
          <div className="space-y-3">
            {alerts.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No SOS alerts</p></GlassCard> :
              alerts.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
