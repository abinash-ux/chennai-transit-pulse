import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Ticket, AlertTriangle, CheckCircle, XCircle, Receipt } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

const violationTypes = [
  'Traveling without ticket',
  'Invalid ticket',
  'Expired pass',
  'Fare evasion',
  'Misbehavior',
];

export default function InspectorDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [selectedViolation, setSelectedViolation] = useState('');
  const [fineAmount, setFineAmount] = useState('100');
  const [isIssuingFine, setIsIssuingFine] = useState(false);
  const [fines, setFines] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadFines();
  }, [user]);

  const loadFines = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('fines')
      .select('*')
      .eq('issued_by', user.id)
      .order('created_at', { ascending: false });
    if (data) setFines(data);
  };

  const totalFines = fines.length;
  const paidFines = fines.filter(f => f.status === 'paid').length;
  const totalRevenue = fines.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    // Search by ticket code
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_code', searchQuery.trim())
      .maybeSingle();
    if (ticket) {
      setSearchResult({ type: 'ticket', data: ticket });
      return;
    }
    // Search by pass code
    const { data: pass } = await supabase
      .from('monthly_passes')
      .select('*')
      .eq('pass_code', searchQuery.trim())
      .maybeSingle();
    if (pass) {
      setSearchResult({ type: 'pass', data: pass });
      return;
    }
    setSearchResult({ type: 'not_found' });
  };

  const handleIssueFine = async () => {
    if (!selectedViolation || !user) return;
    setIsIssuingFine(true);

    // Search for passenger by email-like query or use a generic approach
    const { data: passenger } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('email', '%passenger%')
      .limit(1)
      .maybeSingle();

    const passengerId = passenger?.user_id || user.id;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    const { error } = await supabase.from('fines').insert({
      passenger_id: passengerId,
      issued_by: user.id,
      violation_type: selectedViolation,
      amount: parseFloat(fineAmount),
      deadline: deadline.toISOString().split('T')[0],
    });

    if (error) {
      toast.error('Failed to issue fine');
    } else {
      // Notify passenger
      await supabase.from('notifications').insert({
        user_id: passengerId,
        title: 'Fine Issued',
        message: `A fine of ₹${fineAmount} has been issued for: ${selectedViolation}`,
        type: 'warning',
      });
      toast.success(`Fine of ₹${fineAmount} issued successfully`);
      setSelectedViolation('');
      setFineAmount('100');
      loadFines();
    }
    setIsIssuingFine(false);
  };

  const todayFines = fines.filter(f => {
    const today = new Date().toISOString().split('T')[0];
    return f.created_at.startsWith(today);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fines" value={totalFines} icon={AlertTriangle} />
        <StatCard title="Paid Fines" value={paidFines} icon={CheckCircle} />
        <StatCard title="Fine Revenue" value={totalRevenue} prefix="₹" icon={Receipt} />
        <StatCard title="Today's Fines" value={todayFines.length} icon={Ticket} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ticket Verification */}
        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Verify Ticket/Pass</h3>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter ticket code or pass code..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12" />
            </div>
            <Button className="w-full btn-glow h-12" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />Verify
            </Button>

            {searchResult?.type === 'ticket' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${searchResult.data.status === 'active' ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {searchResult.data.status === 'active' ? <CheckCircle className="h-6 w-6 text-success" /> : <XCircle className="h-6 w-6 text-destructive" />}
                    <span className="font-semibold capitalize">{searchResult.data.status} Ticket</span>
                  </div>
                  <Badge className={searchResult.data.status === 'active' ? 'badge-success' : 'badge-danger'}>{searchResult.data.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">From</p><p className="font-medium">{searchResult.data.from_stop}</p></div>
                  <div><p className="text-muted-foreground">To</p><p className="font-medium">{searchResult.data.to_stop}</p></div>
                  <div><p className="text-muted-foreground">Fare</p><p className="font-medium">₹{searchResult.data.fare}</p></div>
                  <div><p className="text-muted-foreground">Code</p><p className="font-mono font-medium">{searchResult.data.ticket_code}</p></div>
                </div>
              </motion.div>
            )}

            {searchResult?.type === 'pass' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${searchResult.data.is_active ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                  <Badge className={searchResult.data.is_active ? 'badge-success' : 'badge-danger'}>{searchResult.data.is_active ? 'Active' : 'Expired'}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{searchResult.data.pass_type}</p></div>
                  <div><p className="text-muted-foreground">Valid Until</p><p className="font-medium">{searchResult.data.valid_until}</p></div>
                </div>
              </motion.div>
            )}

            {searchResult?.type === 'not_found' && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="font-semibold text-destructive">Not Found</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Issue Fine */}
        <GlassCard>
          <h3 className="font-display text-xl font-bold mb-6">Issue Fine</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Violation Type</Label>
              <Select value={selectedViolation} onValueChange={setSelectedViolation}>
                <SelectTrigger><SelectValue placeholder="Select violation" /></SelectTrigger>
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
                  <Button key={amount} variant={fineAmount === amount ? 'default' : 'outline'} size="sm" onClick={() => setFineAmount(amount)}>₹{amount}</Button>
                ))}
              </div>
              <Input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} className="mt-2" />
            </div>
            <Button className="w-full btn-glow h-12" onClick={handleIssueFine} disabled={!selectedViolation || isIssuingFine}>
              {isIssuingFine ? 'Processing...' : <><AlertTriangle className="mr-2 h-4 w-4" />Issue Fine - ₹{fineAmount}</>}
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Today's Fines */}
      <GlassCard>
        <h3 className="font-display text-lg font-semibold mb-4">Recent Fines</h3>
        <div className="space-y-2">
          {fines.slice(0, 5).length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No fines issued yet</p>
          ) : fines.slice(0, 5).map((fine, index) => (
            <motion.div key={fine.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
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
                <Badge className={fine.status === 'paid' ? 'badge-success' : 'badge-warning'}>{fine.status}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
