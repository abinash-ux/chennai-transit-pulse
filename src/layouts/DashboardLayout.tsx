import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bus, 
  LayoutDashboard, 
  MapPin, 
  Ticket, 
  Wallet, 
  CalendarDays,
  AlertTriangle,
  MessageSquare,
  Receipt,
  Bell,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarNavItem } from '@/components/SidebarNavItem';
import { useAuth } from '@/lib/auth';
import { NotificationPanel, useUnreadCount } from '@/components/NotificationPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const passengerNavItems = [
  { to: '/dashboard/passenger', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/passenger/planner', icon: Navigation, label: 'Trip Planner' },
  { to: '/dashboard/passenger/track', icon: MapPin, label: 'Track Bus' },
  { to: '/dashboard/passenger/tickets', icon: Ticket, label: 'My Tickets' },
  { to: '/dashboard/passenger/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/dashboard/passenger/pass', icon: CalendarDays, label: 'Monthly Pass' },
  { to: '/dashboard/passenger/reroute', icon: AlertTriangle, label: 'Reroute Request' },
  { to: '/dashboard/passenger/complaints', icon: MessageSquare, label: 'Complaints' },
  { to: '/dashboard/passenger/fines', icon: Receipt, label: 'My Fines' },
];

const driverNavItems = [
  { to: '/dashboard/driver', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/driver/route', icon: MapPin, label: 'My Route' },
  { to: '/dashboard/driver/alerts', icon: Bell, label: 'Alerts' },
  { to: '/dashboard/driver/sos', icon: AlertTriangle, label: 'SOS' },
  { to: '/dashboard/driver/requests', icon: Bus, label: 'Bus Requests' },
];

const conductorNavItems = [
  { to: '/dashboard/conductor', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/conductor/tickets', icon: Ticket, label: 'Issue Ticket' },
  { to: '/dashboard/conductor/validate', icon: Ticket, label: 'Validate QR' },
  { to: '/dashboard/conductor/passengers', icon: User, label: 'Passenger Load' },
  { to: '/dashboard/conductor/revenue', icon: Receipt, label: 'Revenue' },
];

const inspectorNavItems = [
  { to: '/dashboard/inspector', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/inspector/check', icon: Ticket, label: 'Check Ticket' },
  { to: '/dashboard/inspector/fines', icon: Receipt, label: 'Issue Fine' },
  { to: '/dashboard/inspector/analytics', icon: Receipt, label: 'Fine Analytics' },
];

const adminNavItems = [
  { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/admin/fleet', icon: Bus, label: 'Fleet Monitor' },
  { to: '/dashboard/admin/routing', icon: MapPin, label: 'AI Routing' },
  { to: '/dashboard/admin/revenue', icon: Receipt, label: 'Revenue' },
  { to: '/dashboard/admin/complaints', icon: MessageSquare, label: 'Complaints' },
  { to: '/dashboard/admin/sos', icon: AlertTriangle, label: 'SOS Center' },
];

const roleNavItems: Record<string, typeof passengerNavItems> = {
  passenger: passengerNavItems,
  driver: driverNavItems,
  conductor: conductorNavItems,
  inspector: inspectorNavItems,
  admin: adminNavItems,
};

const roleLabels: Record<string, string> = {
  passenger: 'Passenger',
  driver: 'Driver',
  conductor: 'Conductor',
  inspector: 'Inspector',
  admin: 'Administrator',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userRole, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = roleNavItems[userRole || 'passenger'] || passengerNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className={cn(
          'hidden lg:flex flex-col border-r border-border bg-sidebar fixed h-full z-40',
          'transition-all duration-300'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="font-display text-lg font-bold gradient-text">
                  Smart Chennai
                </h1>
                <p className="text-xs text-muted-foreground">
                  {roleLabels[userRole || 'passenger']} Portal
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.to}
              {...item}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-center"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bus className="h-6 w-6 text-primary" />
              <span className="font-display font-bold gradient-text">Smart Chennai</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                {profile?.full_name || 'User'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bus className="h-6 w-6 text-primary" />
                  <span className="font-display font-bold gradient-text">Smart Chennai</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.to} onClick={() => setMobileMenuOpen(false)}>
                  <SidebarNavItem {...item} />
                </div>
              ))}
            </nav>
          </motion.aside>
        </motion.div>
      )}

      {/* Main Content */}
      <main 
        className={cn(
          'flex-1 min-h-screen',
          'lg:ml-[260px]',
          !sidebarOpen && 'lg:ml-20',
          'pt-16 lg:pt-0'
        )}
        style={{ marginLeft: sidebarOpen ? 260 : 80 }}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Welcome back, {profile?.full_name || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {roleLabels[userRole || 'passenger']} Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline">{profile?.full_name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
