import { useState } from 'react';
import { Search, CheckCircle, XCircle, User } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function InspectorCheckTicket() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);

    // Search tickets by code
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .ilike('ticket_code', `%${query.trim()}%`)
      .limit(10);

    // Search passes by code
    const { data: passes } = await supabase
      .from('monthly_passes')
      .select('*')
      .ilike('pass_code', `%${query.trim()}%`)
      .limit(10);

    const combined = [
      ...(tickets || []).map(t => ({ ...t, _type: 'ticket' })),
      ...(passes || []).map(p => ({ ...p, _type: 'pass' })),
    ];
    setResults(combined);
    setSearching(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Check Ticket / Pass</h2>

      <GlassCard glow>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket code or pass code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching} className="h-12 btn-glow">
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </GlassCard>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((item) => (
            <GlassCard key={item.id}>
              {item._type === 'ticket' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Ticket</Badge>
                      <span className="font-mono font-bold">{item.ticket_code}</span>
                    </div>
                    <p className="text-muted-foreground">{item.from_stop} → {item.to_stop} • ₹{item.fare}</p>
                  </div>
                  <Badge className={
                    item.status === 'active' ? 'badge-success' :
                    item.status === 'used' ? 'badge-info' : 'badge-danger'
                  }>{item.status}</Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Pass</Badge>
                      <span className="font-mono font-bold">{item.pass_code}</span>
                    </div>
                    <p className="text-muted-foreground capitalize">{item.pass_type} • Valid: {item.valid_from} to {item.valid_until}</p>
                  </div>
                  <Badge className={item.is_active ? 'badge-success' : 'badge-danger'}>
                    {item.is_active ? 'Active' : 'Expired'}
                  </Badge>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {results.length === 0 && query && !searching && (
        <GlassCard>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No results found</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
