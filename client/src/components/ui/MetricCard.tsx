import React from 'react';

import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, trendPositive }) => {
  return (
    <div className="bg-white rounded-lg border border-brand-border p-5 shadow-level-1 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
        <div className="w-8 h-8 rounded-md bg-brand-subSurface flex items-center justify-center text-brand-navy">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="font-sans text-3xl font-bold tracking-tight text-brand-navy tnum">{value}</div>
        {trend && (
          <div className="mt-2 text-xs font-medium">
            <span
              className={cn("px-1.5 py-0.5 rounded-sm", {
                'bg-status-approved-fill text-status-approved-text': trendPositive,
                'bg-status-rejected-fill text-status-rejected-text': trendPositive === false,
                'text-slate-500': trendPositive === undefined,
              })}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
