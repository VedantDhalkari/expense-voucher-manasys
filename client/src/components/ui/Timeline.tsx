import React from 'react';
import { format } from 'date-fns';
import type { VoucherStatus } from './StatusBadge';
import { StatusBadge } from './StatusBadge';

export interface TimelineEvent {
  id: string;
  action: string;
  note?: string | null;
  createdAt: string;
  actor: { email: string };
  previousStatus?: VoucherStatus | null;
  newStatus?: VoucherStatus | null;
}

export const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          {/* Vertical Line */}
          {index !== events.length - 1 && (
            <div className="absolute top-8 bottom-[-24px] left-[11px] w-[2px] bg-brand-border" />
          )}
          
          {/* Node Indicator */}
          <div className="relative z-10 w-6 h-6 rounded-full bg-brand-surface border-2 border-brand-borderAccent shrink-0 flex items-center justify-center mt-1">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-brand-navy">{event.action.replace(/_/g, ' ')}</span>
              <span className="text-xs text-slate-500 tnum">{format(new Date(event.createdAt), 'dd MMM yyyy HH:mm')}</span>
            </div>
            
            <div className="text-sm text-slate-600 mb-2">
              by <span className="font-medium text-brand-slate">{event.actor.email}</span>
            </div>
            
            {event.note && (
              <div className="bg-brand-surface rounded-md p-3 text-sm text-brand-navy border border-brand-border">
                {event.note}
              </div>
            )}
            
            {event.newStatus && event.action !== 'CREATED' && (
              <div className="mt-3 flex items-center gap-2">
                {event.previousStatus && <StatusBadge status={event.previousStatus} />}
                <span className="text-slate-400">→</span>
                <StatusBadge status={event.newStatus} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
