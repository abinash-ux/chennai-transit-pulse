import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

const passTypes = [
  { type: 'all_routes', label: 'All Routes Pass', price: 1200, description: 'Unlimited travel on all MTC routes' },
  { type: 'zone_a', label: 'Zone A Pass', price: 800, description: 'Travel within Zone A (City Center)' },
  { type: 'zone_b', label: 'Zone B Pass', price: 600, description: 'Travel within Zone B (Suburban)' },
  { type: 'student', label: 'Student Pass', price: 400, description: 'Student concession - all routes (ID required)' },
];

export default function MonthlyPass() {
  const { user } = useAuth();
  const [activePasses, setActivePasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof passTypes[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) fetchPasses();
  }, [user]);

  const fetchPasses = async () => {
    const { data } = await supabase
      .from('monthly_passes')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setActivePasses(data || []);
    setLoading(false);
  };

  const handleBuyPass = async () => {
    if (!selectedType || !user) return;
    setBuying(true);

    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    const passCode = `MTC-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from('monthly_passes').insert({
      user_id: user.id,
      pass_type: selectedType.type,
      pass_code: passCode,
      price: selectedType.price,
      valid_from: validFrom.toISOString().split('T')[0],
      valid_until: validUntil.toISOString().split('T')[0],
      is_active: true,
    });

    if (error) {
      toast.error('Failed to purchase pass: ' + error.message);
    } else {
      toast.success('Monthly pass purchased successfully!');
      // Deduct from wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();
      if (wallet && wallet.balance >= selectedType.price) {
        await supabase
          .from('wallets')
          .update({ balance: wallet.balance - selectedType.price })
          .eq('id', wallet.id);
        await supabase.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          amount: selectedType.price,
          transaction_type: 'debit',
          description: `Monthly Pass - ${selectedType.label}`,
        });
      }
      fetchPasses();
    }

    setBuying(false);
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Monthly Pass</h2>
        <p className="text-muted-foreground">Buy and manage your monthly travel passes</p>
      </div>

      {/* Active Passes */}
      {activePasses.filter(p => p.is_active).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">Active Passes</h3>
          {activePasses.filter(p => p.is_active).map((pass) => (
            <GlassCard key={pass.id} glow>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-success text-success-foreground mb-2">Active</Badge>
                  <h4 className="font-display text-xl font-bold text-primary">
                    {passTypes.find(p => p.type === pass.pass_type)?.label || pass.pass_type}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Valid: {new Date(pass.valid_from).toLocaleDateString()} - {new Date(pass.valid_until).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-success/20">
                  <CreditCard className="h-8 w-8 text-success" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pass Code</span>
                  <span className="font-mono font-bold">{pass.pass_code}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Available Passes */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold">Available Passes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {passTypes.map((pt, index) => (
            <motion.div
              key={pt.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-2xl font-display font-bold text-primary">₹{pt.price}</span>
                </div>
                <h4 className="font-display text-lg font-semibold">{pt.label}</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{pt.description}</p>
                <p className="text-xs text-muted-foreground mb-4">Validity: 30 days from purchase</p>
                <Button
                  className="w-full btn-glow"
                  onClick={() => { setSelectedType(pt); setDialogOpen(true); }}
                >
                  Buy Pass
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Past Passes */}
      {activePasses.filter(p => !p.is_active).length > 0 && (
        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">Past Passes</h3>
          <div className="space-y-3">
            {activePasses.filter(p => !p.is_active).map((pass) => (
              <div key={pass.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div>
                  <p className="font-medium">{passTypes.find(p => p.type === pass.pass_type)?.label || pass.pass_type}</p>
                  <p className="text-xs text-muted-foreground">Expired: {new Date(pass.valid_until).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline">Expired</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Confirm Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          {selectedType && (
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-semibold">{selectedType.label}</h4>
                <p className="text-sm text-muted-foreground">{selectedType.description}</p>
                <p className="text-2xl font-bold text-primary mt-2">₹{selectedType.price}</p>
                <p className="text-xs text-muted-foreground">Will be deducted from wallet</p>
              </div>
              <Button className="w-full btn-glow" onClick={handleBuyPass} disabled={buying}>
                {buying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {buying ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
