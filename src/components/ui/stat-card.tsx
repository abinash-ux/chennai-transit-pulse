import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animated-counter';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  suffix, 
  prefix, 
  icon: Icon,
  trend,
  className 
}: StatCardProps) {
  return (
    <motion.div
      className={cn('stat-card group', className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="text-3xl font-display font-bold text-foreground">
            <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
          </div>
          {trend && (
            <p className={cn(
              'text-sm mt-2',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}% from last week
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
