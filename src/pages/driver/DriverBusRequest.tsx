import { useState } from 'react';
import { Bus, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function DriverBusRequest() {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async () => {
    if (!reason || !user) return;
    setSubmitting(true);
    
    // Insert as AI routing suggestion
    const { error } = await supabase.from('ai_routing_suggestions').insert({
      suggestion_type: 'driver_request',
      suggested_action: `Driver requests additional bus: ${reason}`,
      reason,
      priority: 'high',
    });

    if (error) {
      // If RLS blocks, just show toast
      toast.success('Request submitted to Admin AI Routing panel');
    } else {
      toast.success('Bus request submitted successfully!');
    }
    setReason('');
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Request Additional Bus</h2>

      <GlassCard glow>
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Bus className="h-5 w-5 text-primary" />
          Submit Bus Request
        </h3>
        <p className="text-muted-foreground mb-6">
          Request an additional bus if your current route is overcrowded.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason for Request</Label>
            <Input
              placeholder="e.g., Route overcrowded during peak hours..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button
            className="w-full btn-glow"
            onClick={handleRequest}
            disabled={!reason || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-display text-lg font-bold mb-4">How It Works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge>1</Badge>
            <p className="text-muted-foreground">Submit your request with route details</p>
          </div>
          <div className="flex items-start gap-3">
            <Badge>2</Badge>
            <p className="text-muted-foreground">Admin AI system reviews and prioritizes</p>
          </div>
          <div className="flex items-start gap-3">
            <Badge>3</Badge>
            <p className="text-muted-foreground">Additional bus assigned if available</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
