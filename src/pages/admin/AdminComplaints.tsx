import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Eye, XCircle, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [compRes, profRes] = await Promise.all([
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, full_name, email'),
    ]);
    if (compRes.data) setComplaints(compRes.data);
    if (profRes.data) setProfiles(profRes.data);
    setLoading(false);
  };

  const getReporter = (userId: string) => profiles.find(p => p.user_id === userId);

  const updateStatus = async (id: string, status: string, reportedBy: string) => {
    if (!user) return;
    const updates: any = {
      status,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    };
    if (responseText) updates.admin_response = responseText;

    const { error } = await supabase.from('complaints').update(updates).eq('id', id);
    if (!error) {
      // Notify the passenger
      await supabase.from('notifications').insert({
        user_id: reportedBy,
        title: `Complaint ${status === 'resolved' ? 'Resolved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
        message: responseText || `Your complaint has been ${status}.`,
        type: status === 'resolved' ? 'success' : 'warning',
      });
      toast.success(`Complaint ${status}`);
      setResponseText('');
      loadData();
    }
  };

  const filtered = complaints.filter(c => {
    const reporter = getReporter(c.reported_by);
    return c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.bus_number?.toLowerCase().includes(search.toLowerCase()) ||
      reporter?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      reporter?.email?.toLowerCase().includes(search.toLowerCase());
  });

  const pending = filtered.filter(c => c.status === 'pending');
  const underReview = filtered.filter(c => c.status === 'under_review');
  const resolved = filtered.filter(c => c.status === 'resolved');
  const rejected = filtered.filter(c => c.status === 'rejected');

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { pending: 'badge-warning', under_review: 'badge-info', resolved: 'badge-success', rejected: 'badge-danger' };
    return <Badge className={map[s] || ''}>{s.replace('_', ' ')}</Badge>;
  };

  const ComplaintCard = ({ c }: { c: any }) => {
    const reporter = getReporter(c.reported_by);
    return (
      <div className="p-4 rounded-lg border bg-muted/10 border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-semibold capitalize">{c.complaint_type.replace(/_/g, ' ')}</span>
              {statusBadge(c.status)}
            </div>
            <p className="text-muted-foreground">{c.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {reporter && <span>👤 {reporter.full_name} ({reporter.email})</span>}
              {c.bus_number && <span>🚌 Bus: {c.bus_number}</span>}
              <span>📅 {new Date(c.created_at).toLocaleString()}</span>
            </div>
            {c.admin_response && (
              <div className="mt-2 p-2 rounded bg-primary/10 text-sm">
                <span className="font-medium">Admin Response: </span>{c.admin_response}
              </div>
            )}
          </div>
          {(c.status === 'pending' || c.status === 'under_review') && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />Action</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Respond to Complaint</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="font-medium capitalize">{c.complaint_type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    {reporter && <p className="text-sm mt-1">From: {reporter.full_name}</p>}
                  </div>
                  <Textarea
                    placeholder="Admin response to passenger..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    {c.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, 'under_review', c.reported_by)}>
                        <Clock className="h-4 w-4 mr-1" />Mark Under Review
                      </Button>
                    )}
                    <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => updateStatus(c.id, 'resolved', c.reported_by)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Resolve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(c.id, 'rejected', c.reported_by)}>
                      <XCircle className="h-4 w-4 mr-1" />Reject
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Complaint Management</h2>
        <div className="flex items-center gap-2">
          <Badge className="badge-warning">{pending.length} Pending</Badge>
          <Badge>{complaints.length} Total</Badge>
        </div>
      </div>

      <Input
        placeholder="Search by description, bus number, or reporter..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-warning">{pending.length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-primary">{underReview.length}</p>
          <p className="text-xs text-muted-foreground">Under Review</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-success">{resolved.length}</p>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-destructive">{rejected.length}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </GlassCard>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({underReview.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <div className="space-y-3">
            {pending.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No pending complaints</p></GlassCard> :
              pending.map(c => <ComplaintCard key={c.id} c={c} />)}
          </div>
        </TabsContent>
        <TabsContent value="under_review">
          <div className="space-y-3">
            {underReview.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No complaints under review</p></GlassCard> :
              underReview.map(c => <ComplaintCard key={c.id} c={c} />)}
          </div>
        </TabsContent>
        <TabsContent value="resolved">
          <div className="space-y-3">
            {resolved.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No resolved complaints</p></GlassCard> :
              resolved.map(c => <ComplaintCard key={c.id} c={c} />)}
          </div>
        </TabsContent>
        <TabsContent value="all">
          <div className="space-y-3">
            {filtered.length === 0 ? <GlassCard><p className="text-muted-foreground text-center py-8">No complaints</p></GlassCard> :
              filtered.map(c => <ComplaintCard key={c.id} c={c} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
