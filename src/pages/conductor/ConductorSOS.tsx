import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Wrench, Heart, Clock, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sosTypes = [
  { value: 'mechanical', label: 'Mechanical Issue', icon: Wrench },
  { value: 'accident', label: 'Accident', icon: AlertTriangle },
  { value: 'security', label: 'Security Threat', icon: Shield },
  { value: 'medical', label: 'Medical Emergency', icon: Heart },
  { value: 'other', label: 'Other', icon: AlertTriangle },
] as const;

export default function ConductorSOS() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sosType, setSosType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sos_alerts')
      .select('*')
      .eq('reported_by', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setAlerts(data);
  };

  const handleSubmit = async () => {
    if (!user || !sosType || !description.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('sos_alerts').insert({
      reported_by: user.id,
      reporter_role: 'conductor' as const,
      sos_type: sosType as any,
      description: description.trim(),
    });

    if (error) {
      toast.error('Failed to send SOS alert');
    } else {
      toast.success('SOS alert sent to Admin!');
      setSosType('');
      setDescription('');
      loadAlerts();
    }
    setSubmitting(false);
  };

  const statusColor = (s: string) =>
    s === 'resolved' ? 'badge-success' : s === 'acknowledged' ? 'badge-warning' : 'badge-danger';

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">SOS Alerts</h2>

      <GlassCard glow>
        <h3 className="font-display text-lg font-bold mb-4">Report Emergency</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Emergency Type</Label>
            <Select value={sosType} onValueChange={setSosType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {sosTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the emergency..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            className="w-full bg-destructive hover:bg-destructive/90"
            onClick={handleSubmit}
            disabled={!sosType || !description.trim() || submitting}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Send SOS Alert
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-display text-lg font-bold mb-4">My SOS History</h3>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No SOS alerts sent</p>
          ) : alerts.map(alert => (
            <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="font-medium capitalize">{alert.sos_type}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{alert.description}</p>
                </div>
              </div>
              <Badge className={statusColor(alert.status)}>{alert.status}</Badge>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
