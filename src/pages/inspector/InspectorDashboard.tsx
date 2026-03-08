import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Ticket, User, AlertTriangle, CheckCircle, XCircle, Receipt } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const violationTypes = [
  'Traveling without ticket',
  'Invalid ticket',
  'Expired pass',
  'Fare evasion',
  'Misbehavior',
];

export default function InspectorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedViolation, setSelectedViolation] = useState('');
  const [fineAmount, setFineAmount] = useState('100');
  const [isIssuingFine, setIsIssuingFine] = useState(false);

  const [stats, setStats] = useState({
    ticketsChecked: 89,
    finesIssued: 5,
    totalFineAmount: 750,
    passValidations: 34,
  });

  const handleIssueFine = async () => {
    setIsIssuingFine(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStats(prev => ({
      ...prev,
      finesIssued: prev.finesIssued + 1,
      totalFineAmount: prev.totalFineAmount + parseInt(fineAmount),
    }));
    
    toast.success(`Fine of ₹${fineAmount} issued successfully`);
    setIsIssuingFine(false);
    setSelectedViolation('');
    setFineAmount('100');
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tickets Checked" value={stats.ticketsChecked} icon={Ticket} />
        <StatCard title="Fines Issued" value={stats.finesIssued} icon={AlertTriangle} />
        <StatCard title="Fine Revenue" value={stats.totalFineAmount} prefix="₹" icon={Receipt} />
        <StatCard title="Pass Validations" value={stats.passValidations} icon={CheckCircle} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ticket Verification */}
        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Verify Ticket/Pass</h3>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter ticket code or passenger ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <Button className="w-full btn-glow h-12">
              <Search className="mr-2 h-4 w-4" />
              Verify
            </Button>

            {/* Mock search result */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-success bg-success/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-success" />
                    <span className="font-semibold text-success">Valid Ticket</span>
                  </div>
                  <Badge className="badge-success">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">T. Nagar</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">To</p>
                    <p className="font-medium">Central</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fare</p>
                    <p className="font-medium">₹25</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid Until</p>
                    <p className="font-medium">14:00 Today</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Issue Fine */}
        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Issue Fine</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Passenger ID / Phone</Label>
              <Input placeholder="Enter passenger details" />
            </div>

            <div className="space-y-2">
              <Label>Violation Type</Label>
              <Select value={selectedViolation} onValueChange={setSelectedViolation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select violation" />
                </SelectTrigger>
                <SelectContent>
                  {violationTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fine Amount (₹)</Label>
              <div className="flex gap-2">
                {['50', '100', '200', '500'].map((amount) => (
                  <Button
                    key={amount}
                    variant={fineAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFineAmount(amount)}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
              <Input 
                type="number" 
                value={fineAmount} 
                onChange={(e) => setFineAmount(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input placeholder="Additional details..." />
            </div>

            <Button 
              className="w-full btn-glow h-12"
              onClick={handleIssueFine}
              disabled={!selectedViolation || isIssuingFine}
            >
              {isIssuingFine ? 'Processing...' : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Issue Fine - ₹{fineAmount}
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Recent Fines */}
      <GlassCard>
        <h3 className="font-display text-lg font-semibold mb-4">Today's Fines</h3>
        <div className="space-y-2">
          {[
            { passenger: 'Passenger #2341', violation: 'Traveling without ticket', amount: 200, status: 'pending', time: '10:30 AM' },
            { passenger: 'Passenger #1892', violation: 'Expired pass', amount: 100, status: 'paid', time: '09:45 AM' },
            { passenger: 'Passenger #3421', violation: 'Fare evasion', amount: 150, status: 'pending', time: '08:20 AM' },
          ].map((fine, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/20"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">{fine.passenger}</p>
                  <p className="text-sm text-muted-foreground">{fine.violation}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-destructive">₹{fine.amount}</span>
                <Badge className={fine.status === 'paid' ? 'badge-success' : 'badge-warning'}>
                  {fine.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{fine.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
