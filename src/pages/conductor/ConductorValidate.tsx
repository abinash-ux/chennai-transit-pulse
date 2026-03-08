import { useState } from 'react';
import { Search, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ConductorValidate() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);

    // Search by ticket code
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_code', query.trim())
      .maybeSingle();

    if (ticket) {
      setResult({ type: 'ticket', data: ticket });
    } else {
      // Search by pass code
      const { data: pass } = await supabase
        .from('monthly_passes')
        .select('*')
        .eq('pass_code', query.trim())
        .maybeSingle();
      
      if (pass) {
        setResult({ type: 'pass', data: pass });
      } else {
        setResult({ type: 'not_found' });
      }
    }
    setSearching(false);
  };

  const markTicketUsed = async () => {
    if (!result?.data?.id) return;
    const { error } = await supabase
      .from('tickets')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', result.data.id);
    
    if (error) {
      toast.error('Failed to mark ticket');
    } else {
      toast.success('Ticket marked as used!');
      setResult({ ...result, data: { ...result.data, status: 'used' } });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Validate Ticket / Pass</h2>

      <GlassCard glow>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter ticket code or pass code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching} className="h-12 btn-glow">
            {searching ? 'Searching...' : 'Validate'}
          </Button>
        </div>

        {result && result.type === 'ticket' && (
          <div className={`mt-4 p-4 rounded-lg border ${
            result.data.status === 'active' ? 'bg-success/10 border-success/30' :
            result.data.status === 'used' ? 'bg-warning/10 border-warning/30' :
            'bg-destructive/10 border-destructive/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {result.data.status === 'active' ? (
                  <CheckCircle className="h-6 w-6 text-success" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
                <span className="font-semibold capitalize">{result.data.status} Ticket</span>
              </div>
              <Badge className={result.data.status === 'active' ? 'badge-success' : 'badge-danger'}>
                {result.data.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">From</p><p className="font-medium">{result.data.from_stop}</p></div>
              <div><p className="text-muted-foreground">To</p><p className="font-medium">{result.data.to_stop}</p></div>
              <div><p className="text-muted-foreground">Fare</p><p className="font-medium">₹{result.data.fare}</p></div>
              <div><p className="text-muted-foreground">Code</p><p className="font-mono font-medium">{result.data.ticket_code}</p></div>
            </div>
            {result.data.status === 'active' && (
              <Button className="w-full mt-4" onClick={markTicketUsed}>
                <CheckCircle className="mr-2 h-4 w-4" />Mark as Used
              </Button>
            )}
          </div>
        )}

        {result && result.type === 'pass' && (
          <div className={`mt-4 p-4 rounded-lg border ${
            result.data.is_active ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-success" />
                <span className="font-semibold">Monthly Pass</span>
              </div>
              <Badge className={result.data.is_active ? 'badge-success' : 'badge-danger'}>
                {result.data.is_active ? 'Active' : 'Expired'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Pass Type</p><p className="font-medium capitalize">{result.data.pass_type}</p></div>
              <div><p className="text-muted-foreground">Code</p><p className="font-mono font-medium">{result.data.pass_code}</p></div>
              <div><p className="text-muted-foreground">Valid From</p><p className="font-medium">{result.data.valid_from}</p></div>
              <div><p className="text-muted-foreground">Valid Until</p><p className="font-medium">{result.data.valid_until}</p></div>
            </div>
          </div>
        )}

        {result && result.type === 'not_found' && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="font-semibold text-destructive">Not Found</p>
            <p className="text-sm text-muted-foreground">No ticket or pass found with this code</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
