import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setComplaints(data);
    setLoading(false);
  };

  const resolveComplaint = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('complaints')
      .update({
        status: 'resolved' as const,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (!error) {
      toast.success('Complaint resolved');
      loadComplaints();
    }
  };

  const statusColor = (s: string) => {
    if (s === 'resolved') return 'badge-success';
    if (s === 'under_review') return 'badge-warning';
    if (s === 'rejected') return 'badge-danger';
    return 'badge-info';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Complaint Management</h2>
        <Badge>{complaints.filter(c => c.status === 'pending').length} Pending</Badge>
      </div>

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <GlassCard><p className="text-muted-foreground text-center py-8">No complaints</p></GlassCard>
        ) : (
          complaints.map((c) => (
            <GlassCard key={c.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-semibold capitalize">{c.complaint_type.replace(/_/g, ' ')}</span>
                    <Badge className={statusColor(c.status)}>{c.status}</Badge>
                  </div>
                  <p className="text-muted-foreground">{c.description}</p>
                  {c.bus_number && <p className="text-sm text-muted-foreground mt-1">Bus: {c.bus_number}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                {c.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => resolveComplaint(c.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Resolve
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
