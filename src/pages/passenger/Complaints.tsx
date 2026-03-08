import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

const complaintTypes = [
  { value: 'bus_didnt_stop', label: 'Bus Did Not Stop' },
  { value: 'rude_driver', label: 'Rude Driver' },
  { value: 'rude_conductor', label: 'Rude Conductor' },
  { value: 'cleanliness', label: 'Cleanliness Issue' },
  { value: 'overcrowding', label: 'Overcrowding' },
  { value: 'other', label: 'Other' },
];

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complaintType, setComplaintType] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .eq('reported_by', user!.id)
      .order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !complaintType || !description) return;
    setSubmitting(true);

    const { error } = await supabase.from('complaints').insert({
      reported_by: user.id,
      complaint_type: complaintType as any,
      bus_number: busNumber || null,
      description,
    });

    if (error) {
      toast.error('Failed to submit: ' + error.message);
    } else {
      toast.success('Complaint submitted successfully!');
      setComplaintType('');
      setBusNumber('');
      setDescription('');
      fetchComplaints();
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'under_review': return <Badge className="bg-primary/20 text-primary border-primary/30"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'resolved': return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'rejected': return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Complaints</h2>
        <p className="text-muted-foreground">Report issues with MTC bus services</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">Submit Complaint</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Complaint Type</Label>
              <Select value={complaintType} onValueChange={setComplaintType}>
                <SelectTrigger className="input-glow">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {complaintTypes.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bus Number (optional)</Label>
              <Input
                placeholder="e.g., 21G"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="input-glow"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-glow min-h-[120px]"
                required
              />
            </div>

            <Button type="submit" className="w-full btn-glow" disabled={submitting || !complaintType}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">My Complaints</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No complaints submitted</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {complaints.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {complaintTypes.find(ct => ct.value === c.complaint_type)?.label || c.complaint_type}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>
                  {c.bus_number && <p className="text-sm text-primary font-medium">Bus: {c.bus_number}</p>}
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                  {c.admin_response && (
                    <div className="mt-2 p-2 rounded bg-primary/10 text-sm">
                      <span className="font-medium">Response: </span>{c.admin_response}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
