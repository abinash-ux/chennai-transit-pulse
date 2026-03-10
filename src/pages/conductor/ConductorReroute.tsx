import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Send } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ConductorReroute() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [busNumber, setBusNumber] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reroute_requests')
      .select('*')
      .eq('requested_by', user.id)
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  const handleSubmit = async () => {
    if (!user || !busNumber.trim() || !description.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('reroute_requests').insert({
      requested_by: user.id,
      bus_number: busNumber.trim(),
      description: description.trim(),
    });

    if (error) {
      toast.error('Failed to submit reroute request');
    } else {
      toast.success('Reroute request submitted to Admin');
      setBusNumber('');
      setDescription('');
      loadRequests();
    }
    setSubmitting(false);
  };

  const statusColor = (s: string) =>
    s === 'approved' ? 'badge-success' : s === 'rejected' ? 'badge-danger' : 'badge-warning';

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Reroute Requests</h2>

      <GlassCard glow>
        <h3 className="font-display text-lg font-bold mb-4">Request Route Change</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bus Number</Label>
            <Input placeholder="e.g. 21G" value={busNumber} onChange={e => setBusNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Reason for Reroute</Label>
            <Textarea
              placeholder="Describe why a reroute is needed..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!busNumber.trim() || !description.trim() || submitting}>
            <Send className="mr-2 h-4 w-4" />Submit Request
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-display text-lg font-bold mb-4">My Requests</h3>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No reroute requests</p>
          ) : requests.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-primary" />
                  <span className="font-medium">Bus {r.bus_number}</span>
                </div>
                <Badge className={statusColor(r.status)}>{r.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
              {r.admin_notes && (
                <p className="text-sm text-primary mt-1">Admin: {r.admin_notes}</p>
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
