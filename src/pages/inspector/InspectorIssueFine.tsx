import { useState, useEffect } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const violationTypes = [
  'Traveling without ticket',
  'Invalid ticket',
  'Expired pass',
  'Fare evasion',
  'Misbehavior',
];

export default function InspectorIssueFine() {
  const { user } = useAuth();
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passenger, setPassenger] = useState<any>(null);
  const [violation, setViolation] = useState('');
  const [amount, setAmount] = useState('100');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentFines, setRecentFines] = useState<any[]>([]);

  useEffect(() => { loadFines(); }, [user]);

  const loadFines = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('fines')
      .select('*')
      .eq('issued_by', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecentFines(data);
  };

  const searchPassenger = async () => {
    if (!passengerEmail.trim()) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${passengerEmail.trim()}%`)
      .limit(1)
      .maybeSingle();
    if (data) {
      setPassenger(data);
      toast.success('Passenger found');
    } else {
      toast.error('Passenger not found');
      setPassenger(null);
    }
  };

  const handleIssueFine = async () => {
    if (!violation || !passenger || !user) return;
    setSubmitting(true);
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    const { error } = await supabase.from('fines').insert({
      passenger_id: passenger.user_id,
      issued_by: user.id,
      violation_type: violation,
      amount: parseFloat(amount),
      deadline: deadline.toISOString().split('T')[0],
      notes: notes || null,
    });

    if (error) {
      toast.error('Failed to issue fine: ' + error.message);
    } else {
      // Create notification for passenger
      await supabase.from('notifications').insert({
        user_id: passenger.user_id,
        title: 'Fine Issued',
        message: `A fine of ₹${amount} has been issued for: ${violation}`,
        type: 'warning',
      });
      toast.success(`Fine of ₹${amount} issued!`);
      setViolation('');
      setAmount('100');
      setNotes('');
      setPassenger(null);
      setPassengerEmail('');
      loadFines();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Issue Fine</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard glow>
          <h3 className="font-display text-lg font-bold mb-4">New Fine</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Passenger (by email)</Label>
              <div className="flex gap-2">
                <Input placeholder="passenger@demo.com" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} />
                <Button onClick={searchPassenger} variant="outline"><Search className="h-4 w-4" /></Button>
              </div>
              {passenger && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <p className="font-semibold">{passenger.full_name}</p>
                  <p className="text-sm text-muted-foreground">{passenger.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Violation Type</Label>
              <Select value={violation} onValueChange={setViolation}>
                <SelectTrigger><SelectValue placeholder="Select violation" /></SelectTrigger>
                <SelectContent>
                  {violationTypes.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fine Amount (₹)</Label>
              <div className="flex gap-2">
                {['50', '100', '200', '500'].map((a) => (
                  <Button key={a} variant={amount === a ? 'default' : 'outline'} size="sm" onClick={() => setAmount(a)}>₹{a}</Button>
                ))}
              </div>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2" />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <Button className="w-full btn-glow h-12" onClick={handleIssueFine}
              disabled={!violation || !passenger || submitting}>
              {submitting ? 'Processing...' : `Issue Fine - ₹${amount}`}
            </Button>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-bold mb-4">Recent Fines</h3>
          <div className="space-y-2">
            {recentFines.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No fines issued yet</p>
            ) : (
              recentFines.map((fine) => (
                <div key={fine.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div>
                    <p className="font-medium">{fine.violation_type}</p>
                    <p className="text-sm text-muted-foreground">{new Date(fine.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-destructive">₹{fine.amount}</span>
                    <Badge className={fine.status === 'paid' ? 'badge-success' : 'badge-warning'}>{fine.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
