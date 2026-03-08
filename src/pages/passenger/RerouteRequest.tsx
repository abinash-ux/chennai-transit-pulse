import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Upload, Loader2, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export default function RerouteRequest() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busNumber, setBusNumber] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('reroute_requests')
      .select('*')
      .eq('requested_by', user!.id)
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !busNumber || !description) return;
    setSubmitting(true);

    const { error } = await supabase.from('reroute_requests').insert({
      requested_by: user.id,
      bus_number: busNumber,
      description,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to submit: ' + error.message);
    } else {
      toast.success('Reroute request submitted!');
      setBusNumber('');
      setDescription('');
      fetchRequests();
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'under_review': return <Badge className="bg-primary/20 text-primary border-primary/30"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'approved': return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Reroute Request</h2>
        <p className="text-muted-foreground">Report overcrowded buses for rerouting</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Submit Form */}
        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">Submit New Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Bus Number</Label>
              <Input
                placeholder="e.g., 21G"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="input-glow"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the overcrowding issue, time, location..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-glow min-h-[120px]"
                required
              />
            </div>

            <Button type="submit" className="w-full btn-glow" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </GlassCard>

        {/* Requests List */}
        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">My Requests</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No reroute requests yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {requests.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-primary">Bus {req.bus_number}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{req.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(req.created_at).toLocaleDateString()}
                  </p>
                  {req.admin_notes && (
                    <div className="mt-2 p-2 rounded bg-primary/10 text-sm">
                      <span className="font-medium">Admin: </span>{req.admin_notes}
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
