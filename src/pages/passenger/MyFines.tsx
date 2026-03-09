import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, AlertTriangle, CheckCircle, Clock, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

type PaymentMethod = 'wallet' | 'card' | 'upi';

export default function MyFines() {
  const { user } = useAuth();
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [confirmFine, setConfirmFine] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');

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

    if (paymentMethod === 'wallet') {
      // Wallet payment — check balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet || wallet.balance < fine.amount) {
        toast.error('Insufficient wallet balance. Please add funds or choose another payment method.');
        setPaying(null);
        return;
      }

      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - fine.amount })
        .eq('id', wallet.id);

      if (walletError) {
        toast.error('Payment failed: ' + walletError.message);
        setPaying(null);
        return;
      }

      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        amount: fine.amount,
        transaction_type: 'debit',
        description: `Fine Payment - ${fine.violation_type}`,
        reference_id: fine.id,
      });
    } else {
      // Card / UPI — simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Mark fine as paid
    const { error: fineError } = await supabase
      .from('fines')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', fine.id);

    if (fineError) {
      toast.error('Failed to update fine status');
    } else {
      const methodLabel = paymentMethod === 'wallet' ? 'Wallet' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI';
      toast.success(`Fine paid successfully via ${methodLabel}!`);
      fetchFines();
    }

    setPaying(null);
    setConfirmFine(null);
    setPaymentMethod('wallet');
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
                    onClick={() => { setConfirmFine(fine); setPaymentMethod('wallet'); }}
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

      {/* Payment Selection Dialog */}
      <Dialog open={!!confirmFine} onOpenChange={() => setConfirmFine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Fine</DialogTitle>
          </DialogHeader>
          {confirmFine && (
            <div className="space-y-5 pt-2">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="font-medium">{confirmFine.violation_type}</p>
                <p className="text-2xl font-bold text-primary mt-2">₹{confirmFine.amount}</p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="space-y-2">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'bg-primary/10 border-primary/40' : 'bg-muted/10 border-border hover:bg-muted/20'}`}>
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Wallet className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Wallet</p>
                      <p className="text-xs text-muted-foreground">Pay from your digital wallet balance</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-primary/10 border-primary/40' : 'bg-muted/10 border-border hover:bg-muted/20'}`}>
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">Pay using Visa, Mastercard, RuPay</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'bg-primary/10 border-primary/40' : 'bg-muted/10 border-border hover:bg-muted/20'}`}>
                    <RadioGroupItem value="upi" id="upi" />
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">UPI</p>
                      <p className="text-xs text-muted-foreground">Pay using Google Pay, PhonePe, Paytm</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <Button className="w-full btn-glow" onClick={() => handlePayFine(confirmFine)} disabled={paying === confirmFine.id}>
                {paying === confirmFine.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {paying === confirmFine.id ? 'Processing...' : `Pay ₹${confirmFine.amount} via ${paymentMethod === 'wallet' ? 'Wallet' : paymentMethod === 'card' ? 'Card' : 'UPI'}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
