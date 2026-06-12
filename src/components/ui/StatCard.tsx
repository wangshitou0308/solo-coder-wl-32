import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: ReactNode;
  gradient: string;
  trend?: { value: number; label: string };
  className?: string;
}

export default function StatCard({ title, value, subtitle, icon, gradient, trend, className }: StatCardProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl p-5 text-white shadow-card', gradient, className)}>
      <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-sm font-medium opacity-90">{title}</div>
          <div className="mt-2 text-3xl font-bold font-serif tracking-tight">{value}</div>
          {subtitle && <div className="mt-1 text-xs opacity-75">{subtitle}</div>}
          {trend && (
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span className={cn('font-medium', trend.value >= 0 ? 'text-emerald-200' : 'text-red-200')}>
                {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
              </span>
              <span className="opacity-80">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-white/15 backdrop-blur-sm">{icon}</div>
      </div>
    </div>
  );
}
