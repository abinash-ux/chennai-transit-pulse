import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const complaintTypes = [
  { value: 'bus_didnt_stop', label: 'Bus Didn\'t Stop' },
  { value: 'rude_conductor', label: 'Rude Conductor' },
  { value: 'rude_driver', label: 'Rude Driver' },
  { value: 'cleanliness', label: 'Cleanliness Issue' },
  { value: 'overcrowding', label: 'Overcrowding' },
  { value: 'other', label: 'Other' },
] as const;

export default function ConductorComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [type, setType] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .eq('reported_by', user.id)
      .order('created_at', { ascending: false });
    if (data) setComplaints(data);
  };

  const handleSubmit = async () => {
    if (!user || !type || !description.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('complaints').insert({
      reported_by: user.id,
      complaint_type: type as any,
      description: description.trim(),
      bus_number: busNumber || null,
    });

    if (error) {
      toast.error('Failed to submit complaint');
    } else {
      toast.success('Complaint submitted successfully');
      setType('');
      setBusNumber('');
      setDescription('');
      loadComplaints();
    }
    setSubmitting(false);
  };

  const statusColor = (s: string) =>
    s === 'resolved' ? 'badge-success' : s === 'under_review' ? 'badge-warning' : 'badge-danger';

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Complaints</h2>

      <GlassCard glow>
        <h3 className="font-display text-lg font-bold mb-4">Submit Complaint</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Complaint Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {complaintTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bus Number (optional)</Label>
            <Input placeholder="e.g. 21G" value={busNumber} onChange={e => setBusNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!type || !description.trim() || submitting}>
            <Send className="mr-2 h-4 w-4" />Submit Complaint
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-display text-lg font-bold mb-4">My Complaints</h3>
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No complaints submitted</p>
          ) : complaints.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium capitalize">{c.complaint_type.replace(/_/g, ' ')}</span>
                </div>
                <Badge className={statusColor(c.status)}>{c.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              {c.admin_response && (
                <p className="text-sm text-primary mt-1">Admin: {c.admin_response}</p>
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
