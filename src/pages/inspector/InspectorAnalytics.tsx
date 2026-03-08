import { useState, useEffect } from 'react';
import { Receipt, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export default function InspectorAnalytics() {
  const { user } = useAuth();
  const [fines, setFines] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('fines')
      .select('*')
      .eq('issued_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setFines(data); });
  }, [user]);

  const totalFines = fines.length;
  const paidFines = fines.filter(f => f.status === 'paid');
  const pendingFines = fines.filter(f => f.status === 'pending');
  const totalRevenue = fines.reduce((sum, f) => sum + Number(f.amount), 0);
  const paidRevenue = paidFines.reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Fine Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fines" value={totalFines} icon={AlertTriangle} />
        <StatCard title="Paid Fines" value={paidFines.length} icon={CheckCircle} />
        <StatCard title="Pending Fines" value={pendingFines.length} icon={Clock} />
        <StatCard title="Fine Revenue" value={paidRevenue} prefix="₹" icon={Receipt} />
      </div>

      <GlassCard>
        <h3 className="font-display text-lg font-bold mb-4">All Fines</h3>
        <div className="space-y-2">
          {fines.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No fines issued</p>
          ) : (
            fines.map((fine) => (
              <div key={fine.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">{fine.violation_type}</p>
                    <p className="text-sm text-muted-foreground">Deadline: {fine.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-destructive">₹{fine.amount}</span>
                  <Badge className={fine.status === 'paid' ? 'badge-success' : fine.status === 'overdue' ? 'badge-danger' : 'badge-warning'}>
                    {fine.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{new Date(fine.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
