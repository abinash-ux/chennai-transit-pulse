import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, History, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockTransactions = [
  { id: '1', type: 'credit', amount: 500, description: 'Wallet Top-up', date: '2024-03-08T10:00:00' },
  { id: '2', type: 'debit', amount: 25, description: 'Bus Ticket - T. Nagar to Central', date: '2024-03-08T09:30:00' },
  { id: '3', type: 'debit', amount: 15, description: 'Bus Ticket - Central to Broadway', date: '2024-03-07T14:00:00' },
  { id: '4', type: 'credit', amount: 1000, description: 'Wallet Top-up', date: '2024-03-06T11:00:00' },
  { id: '5', type: 'debit', amount: 850, description: 'Monthly Pass Purchase', date: '2024-03-01T09:00:00' },
];

export default function PassengerWallet() {
  const [balance, setBalance] = useState(1250);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [addAmount, setAddAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const quickAmounts = [100, 200, 500, 1000];

  const handleAddFunds = async () => {
    const amount = parseInt(addAmount);
    if (!amount || amount < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }

    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setBalance(prev => prev + amount);
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'credit',
      amount,
      description: 'Wallet Top-up',
      date: new Date().toISOString(),
    }, ...prev]);

    toast.success(`₹${amount} added to wallet!`);
    setAddAmount('');
    setIsAdding(false);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">My Wallet</h2>
          <p className="text-muted-foreground">Manage your transit funds</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <GlassCard glow className="md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/20">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <motion.p 
                  className="text-4xl font-display font-bold text-foreground"
                  key={balance}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  ₹{balance.toLocaleString()}
                </motion.p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-glow" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="text-2xl font-bold text-center"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setAddAmount(amount.toString())}
                        className={addAmount === amount.toString() ? 'border-primary bg-primary/10' : ''}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Payment Methods</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg bg-background cursor-pointer hover:bg-muted/50 transition-colors">
                        <input type="radio" name="payment" defaultChecked className="text-primary" />
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span>UPI / Debit Card</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg bg-background cursor-pointer hover:bg-muted/50 transition-colors">
                        <input type="radio" name="payment" className="text-primary" />
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                        <span>Net Banking</span>
                      </label>
                    </div>
                  </div>

                  <Button 
                    className="w-full btn-glow" 
                    onClick={handleAddFunds}
                    disabled={isAdding || !addAmount}
                  >
                    {isAdding ? 'Processing...' : `Add ₹${addAmount || '0'}`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">₹2,150</p>
              <p className="text-xs text-muted-foreground">This Month Credits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">₹900</p>
              <p className="text-xs text-muted-foreground">This Month Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Spending Insights
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Bus Tickets</span>
                <span className="font-medium">₹350</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Monthly Pass</span>
                <span className="font-medium">₹850</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Fines</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-destructive rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Transaction History */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Transaction History
          </h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>

        <div className="space-y-3">
          {transactions.map((txn, index) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  txn.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'
                }`}>
                  {txn.type === 'credit' ? (
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{txn.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(txn.date).toLocaleDateString()} at {new Date(txn.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${
                txn.type === 'credit' ? 'text-success' : 'text-destructive'
              }`}>
                {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
