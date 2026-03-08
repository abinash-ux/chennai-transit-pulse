import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ConductorPassengers() {
  const { user } = useAuth();
  const [bus, setBus] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('buses')
      .select('*')
      .eq('conductor_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data }) => { if (data) setBus(data); });
  }, [user]);

  const occupancy = bus?.current_occupancy || 32;
  const total = bus?.total_seats || 40;
  const pct = Math.round((occupancy / total) * 100);
  const seated = Math.min(occupancy, total);
  const standing = Math.max(0, occupancy - total);

  const reportOvercrowding = async () => {
    if (!user) return;
    await supabase.from('sos_alerts').insert({
      reported_by: user.id,
      reporter_role: 'conductor' as const,
      sos_type: 'other' as const,
      description: `Bus ${bus?.bus_number || 'Unknown'} is overcrowded at ${pct}% capacity`,
    });
    toast.success('Overcrowding alert sent to Admin');
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Passenger Load Monitor</h2>

      <GlassCard glow>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold">Current Status</h3>
          <Badge className={pct > 90 ? 'badge-danger' : pct > 70 ? 'badge-warning' : 'badge-success'}>
            {pct}% Full
          </Badge>
        </div>

        <div className="text-center mb-6">
          <p className="text-6xl font-display font-bold text-primary">{occupancy}</p>
          <p className="text-muted-foreground">of {total} capacity</p>
        </div>

        <Progress value={pct} className="h-4 mb-6" />

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-success/10 text-center">
            <p className="text-3xl font-bold text-success">{seated}</p>
            <p className="text-sm text-muted-foreground">Seated</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 text-center">
            <p className="text-3xl font-bold text-warning">{standing}</p>
            <p className="text-sm text-muted-foreground">Standing</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 text-center">
            <p className="text-3xl font-bold text-primary">{Math.max(0, total - occupancy)}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
        </div>

        {pct > 85 && (
          <Button className="w-full mt-6 bg-destructive hover:bg-destructive/90" onClick={reportOvercrowding}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report Overcrowding
          </Button>
        )}
      </GlassCard>
    </div>
  );
}
