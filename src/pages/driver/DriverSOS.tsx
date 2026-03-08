import { useState } from 'react';
import { AlertTriangle, Shield, Wrench, Car, Heart } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SosType = Database['public']['Enums']['sos_type'];

const sosTypes: { value: SosType; label: string; icon: any; color: string }[] = [
  { value: 'mechanical', label: 'Mechanical Issue', icon: Wrench, color: 'text-warning' },
  { value: 'accident', label: 'Accident', icon: Car, color: 'text-destructive' },
  { value: 'security', label: 'Security Issue', icon: Shield, color: 'text-destructive' },
  { value: 'medical', label: 'Medical Emergency', icon: Heart, color: 'text-destructive' },
  { value: 'other', label: 'Other', icon: AlertTriangle, color: 'text-muted-foreground' },
];

export default function DriverSOS() {
  const { user } = useAuth();
  const [sosType, setSosType] = useState<SosType | ''>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  const loadAlerts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sos_alerts')
      .select('*')
      .eq('reported_by', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecentAlerts(data);
  };

  useState(() => { loadAlerts(); });

  const handleSubmit = async () => {
    if (!sosType || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from('sos_alerts').insert({
      reported_by: user.id,
      reporter_role: 'driver' as const,
      sos_type: sosType as SosType,
      description: description || null,
    });
    if (error) {
      toast.error('Failed to send SOS alert');
    } else {
      toast.success('SOS Alert sent to Admin!');
      setSosType('');
      setDescription('');
      loadAlerts();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Emergency SOS</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard glow>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Send SOS Alert
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {sosTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={sosType === type.value ? 'default' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => setSosType(type.value)}
                  >
                    <Icon className={`h-6 w-6 ${sosType === type.value ? '' : type.color}`} />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                );
              })}
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Describe the emergency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button
              className="w-full h-14 bg-destructive hover:bg-destructive/90"
              onClick={handleSubmit}
              disabled={!sosType || submitting}
            >
              {submitting ? 'Sending...' : '🚨 Send SOS Alert'}
            </Button>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No SOS alerts sent</p>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-muted/20 flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{alert.sos_type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                  <Badge className={
                    alert.status === 'active' ? 'badge-danger' :
                    alert.status === 'acknowledged' ? 'badge-warning' : 'badge-success'
                  }>{alert.status}</Badge>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
