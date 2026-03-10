import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Clock, CheckCircle, Phone } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

const sosTypes = [
  { value: 'security', label: 'Security Threat' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'accident', label: 'Accident' },
  { value: 'other', label: 'Other' },
];

export default function PassengerSOS() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sosType, setSosType] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('sos_alerts')
      .select('*')
      .eq('reported_by', user!.id)
      .order('created_at', { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sosType || !description) return;
    setSubmitting(true);

    const busMatch = busNumber ? await supabase.from('buses').select('id').eq('bus_number', busNumber).maybeSingle() : null;

    const { error } = await supabase.from('sos_alerts').insert({
      reported_by: user.id,
      reporter_role: 'passenger' as const,
      sos_type: sosType as any,
      description,
      bus_id: busMatch?.data?.id || null,
    });

    if (error) {
      toast.error('Failed to send SOS: ' + error.message);
    } else {
      toast.success('SOS alert sent! Admin has been notified.');
      setSosType('');
      setBusNumber('');
      setDescription('');
      fetchAlerts();
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertTriangle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'acknowledged': return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Acknowledged</Badge>;
      case 'resolved': return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">SOS Alerts</h2>
        <p className="text-muted-foreground">Report emergencies for immediate assistance</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard glow>
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />Send SOS Alert
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Emergency Type</Label>
              <Select value={sosType} onValueChange={setSosType}>
                <SelectTrigger className="input-glow"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {sosTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bus Number (optional)</Label>
              <Input placeholder="e.g., TN-01-AB-1234" value={busNumber} onChange={(e) => setBusNumber(e.target.value)} className="input-glow" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the emergency..." value={description} onChange={(e) => setDescription(e.target.value)} className="input-glow min-h-[120px]" required />
            </div>
            <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={submitting || !sosType}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
              {submitting ? 'Sending...' : 'Send SOS Alert'}
            </Button>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">My SOS History</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No SOS alerts sent</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {alerts.map((a, index) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{a.sos_type} Emergency</span>
                    {getStatusBadge(a.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</p>
                  {a.resolution_notes && (
                    <div className="mt-2 p-2 rounded bg-success/10 text-sm">
                      <span className="font-medium">Resolution: </span>{a.resolution_notes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-display text-lg font-semibold mb-3">Emergency Contacts</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: 'MTC Control Room', number: '044-2522-3456' },
            { name: 'Police', number: '100' },
            { name: 'Ambulance', number: '108' },
          ].map((c) => (
            <div key={c.name} className="p-3 rounded-lg bg-muted/20 flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-sm text-primary font-mono">{c.number}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
