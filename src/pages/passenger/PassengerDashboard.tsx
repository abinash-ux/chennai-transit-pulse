import { motion } from 'framer-motion';
import { Bus, Ticket, Wallet, MapPin, AlertTriangle, CreditCard, Calendar } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PassengerDashboard() {
  const navigate = useNavigate();

  const quickActions = [
    { icon: MapPin, label: 'Track Bus', to: '/dashboard/passenger/track', color: 'text-primary' },
    { icon: Ticket, label: 'Buy Ticket', to: '/dashboard/passenger/tickets', color: 'text-success' },
    { icon: Wallet, label: 'Add Funds', to: '/dashboard/passenger/wallet', color: 'text-warning' },
    { icon: Calendar, label: 'Get Pass', to: '/dashboard/passenger/pass', color: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Wallet Balance"
          value={1250}
          prefix="₹"
          icon={Wallet}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Active Tickets"
          value={2}
          icon={Ticket}
        />
        <StatCard
          title="Trips This Month"
          value={24}
          icon={Bus}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Pending Fines"
          value={0}
          prefix="₹"
          icon={AlertTriangle}
        />
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <h3 className="font-display text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.to)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-3 rounded-full bg-background ${action.color}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Recent Trips */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Recent Trips</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/passenger/tickets')}>
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {[
            { route: '21G', from: 'T. Nagar', to: 'Central', time: '2 hrs ago', fare: 25 },
            { route: '47A', from: 'Central', to: 'Broadway', time: '5 hrs ago', fare: 15 },
            { route: '29C', from: 'Broadway', to: 'Egmore', time: 'Yesterday', fare: 20 },
          ].map((trip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-display font-bold text-primary text-sm">{trip.route}</span>
                </div>
                <div>
                  <p className="font-medium">{trip.from} → {trip.to}</p>
                  <p className="text-sm text-muted-foreground">{trip.time}</p>
                </div>
              </div>
              <span className="font-semibold text-primary">₹{trip.fare}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Active Pass */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard glow>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Pass</p>
              <h3 className="font-display text-2xl font-bold text-primary">All Routes</h3>
              <p className="text-sm text-muted-foreground mt-2">Valid until: 31 Mar 2024</p>
            </div>
            <div className="p-3 rounded-xl bg-success/20">
              <CreditCard className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pass Code</span>
              <span className="font-mono font-bold">MTC-2024-78542</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-3">
            {[
              { title: 'Route 21G delayed', time: '10 mins ago', type: 'warning' },
              { title: 'Wallet credited ₹500', time: '1 hr ago', type: 'success' },
              { title: 'New route available', time: '2 hrs ago', type: 'info' },
            ].map((notif, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  notif.type === 'warning' ? 'bg-warning/10 border-l-2 border-warning' :
                  notif.type === 'success' ? 'bg-success/10 border-l-2 border-success' :
                  'bg-primary/10 border-l-2 border-primary'
                }`}
              >
                <p className="font-medium text-sm">{notif.title}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
