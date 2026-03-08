import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminSOS() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('sos_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAlerts(data);
  };

  const acknowledge = async (id: string) => {
    if (!user) return;
    await supabase.from('sos_alerts').update({
      status: 'acknowledged' as const,
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    }).eq('id', id);
    toast.success('Alert acknowledged');
    loadAlerts();
  };

  const resolve = async (id: string) => {
    if (!user) return;
    await supabase.from('sos_alerts').update({
      status: 'resolved' as const,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);
    toast.success('Alert resolved');
    loadAlerts();
  };

  const active = alerts.filter(a => a.status === 'active');
  const acknowledged = alerts.filter(a => a.status === 'acknowledged');
  const resolved = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">SOS Control Center</h2>
        <Badge className="badge-danger">{active.length} Active</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard><p className="text-3xl font-bold text-destructive">{active.length}</p><p className="text-muted-foreground">Active Alerts</p></GlassCard>
        <GlassCard><p className="text-3xl font-bold text-warning">{acknowledged.length}</p><p className="text-muted-foreground">Acknowledged</p></GlassCard>
        <GlassCard><p className="text-3xl font-bold text-success">{resolved.length}</p><p className="text-muted-foreground">Resolved</p></GlassCard>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <GlassCard><p className="text-muted-foreground text-center py-8">No SOS alerts</p></GlassCard>
        ) : (
          alerts.map((alert) => (
            <GlassCard key={alert.id} glow={alert.status === 'active'}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-5 w-5 ${alert.status === 'active' ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <span className="font-bold capitalize">{alert.sos_type.replace('_', ' ')}</span>
                    <Badge className={
                      alert.status === 'active' ? 'badge-danger' :
                      alert.status === 'acknowledged' ? 'badge-warning' : 'badge-success'
                    }>{alert.status}</Badge>
                    <Badge variant="outline" className="capitalize">{alert.reporter_role}</Badge>
                  </div>
                  {alert.description && <p className="text-muted-foreground">{alert.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {alert.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => acknowledge(alert.id)}>Acknowledge</Button>
                  )}
                  {(alert.status === 'active' || alert.status === 'acknowledged') && (
                    <Button size="sm" onClick={() => resolve(alert.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Resolve
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
