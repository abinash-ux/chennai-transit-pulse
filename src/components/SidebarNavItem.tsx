import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number | string;
  collapsed?: boolean;
}

export function SidebarNavItem({ to, icon: Icon, label, badge, collapsed }: SidebarNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <RouterNavLink
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'hover:bg-muted/50',
        isActive && 'nav-active bg-primary/10 text-primary',
        !isActive && 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
      {!collapsed && (
        <>
          <span className="flex-1 font-medium">{label}</span>
          {badge !== undefined && (
            <span className={cn(
              'px-2 py-0.5 text-xs rounded-full',
              typeof badge === 'number' && badge > 0 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            )}>
              {badge}
            </span>
          )}
        </>
      )}
    </RouterNavLink>
  );
}
