import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export default function MyFines() {
  const { user } = useAuth();
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [confirmFine, setConfirmFine] = useState<any | null>(null);

  useEffect(() => {
    if (user) fetchFines();
  }, [user]);

  const fetchFines = async () => {
    const { data } = await supabase
      .from('fines')
      .select('*')
      .eq('passenger_id', user!.id)
      .order('created_at', { ascending: false });
    setFines(data || []);
    setLoading(false);
  };

  const handlePayFine = async (fine: any) => {
    if (!user) return;
    setPaying(fine.id);

    // Get wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.balance < fine.amount) {
      toast.error('Insufficient wallet balance. Please add funds first.');
      setPaying(null);
      setConfirmFine(null);
      return;
    }

    // Deduct from wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance - fine.amount })
      .eq('id', wallet.id);

    if (walletError) {
      toast.error('Payment failed: ' + walletError.message);
      setPaying(null);
      setConfirmFine(null);
      return;
    }

    // Record transaction
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      amount: fine.amount,
      transaction_type: 'debit',
      description: `Fine Payment - ${fine.violation_type}`,
      reference_id: fine.id,
    });

    // Update fine status
    const { error: fineError } = await supabase
      .from('fines')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', fine.id);

    if (fineError) {
      toast.error('Failed to update fine status');
    } else {
      toast.success('Fine paid successfully!');
      fetchFines();
    }

    setPaying(null);
    setConfirmFine(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'paid': return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'overdue': return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingFines = fines.filter(f => f.status === 'pending' || f.status === 'overdue');
  const paidFines = fines.filter(f => f.status === 'paid');
  const totalPending = pendingFines.reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">My Fines</h2>
        <p className="text-muted-foreground">View and pay your fines</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Total Fines</p>
          <p className="text-3xl font-display font-bold">{fines.length}</p>
        </GlassCard>
        <GlassCard glow={totalPending > 0}>
          <p className="text-sm text-muted-foreground">Pending Amount</p>
          <p className="text-3xl font-display font-bold text-warning">₹{totalPending}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-3xl font-display font-bold text-success">{paidFines.length}</p>
        </GlassCard>
      </div>

      {/* Pending Fines */}
      {pendingFines.length > 0 && (
        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4 text-warning">Unpaid Fines</h3>
          <div className="space-y-3">
            {pendingFines.map((fine, index) => (
              <motion.div
                key={fine.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{fine.violation_type}</span>
                    {getStatusBadge(fine.status)}
                  </div>
                  {fine.notes && <p className="text-sm text-muted-foreground">{fine.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Deadline: {new Date(fine.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-destructive">₹{fine.amount}</span>
                  <Button
                    className="btn-glow"
                    onClick={() => setConfirmFine(fine)}
                    disabled={paying === fine.id}
                  >
                    {paying === fine.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay Fine'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Paid Fines */}
      {paidFines.length > 0 && (
        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">Payment History</h3>
          <div className="space-y-3">
            {paidFines.map((fine) => (
              <div key={fine.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div>
                  <span className="font-medium">{fine.violation_type}</span>
                  <p className="text-xs text-muted-foreground">Paid: {fine.paid_at ? new Date(fine.paid_at).toLocaleDateString() : '-'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">₹{fine.amount}</span>
                  {getStatusBadge('paid')}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {fines.length === 0 && (
        <GlassCard>
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No fines found</p>
            <p className="text-sm">You're all clear!</p>
          </div>
        </GlassCard>
      )}

      {/* Confirm Dialog */}
      <Dialog open={!!confirmFine} onOpenChange={() => setConfirmFine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Fine Payment</DialogTitle>
          </DialogHeader>
          {confirmFine && (
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="font-medium">{confirmFine.violation_type}</p>
                <p className="text-2xl font-bold text-primary mt-2">₹{confirmFine.amount}</p>
                <p className="text-xs text-muted-foreground mt-1">Will be deducted from your wallet</p>
              </div>
              <Button className="w-full btn-glow" onClick={() => handlePayFine(confirmFine)} disabled={paying === confirmFine.id}>
                {paying === confirmFine.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {paying === confirmFine.id ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
