import React from 'react';
import { cn } from '../../lib/utils';

export type VoucherStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export const StatusBadge: React.FC<{ status: VoucherStatus; className?: string }> = ({ status, className }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap",
        {
          'bg-status-draft-fill text-status-draft-text border border-status-draft-border': status === 'DRAFT',
          'bg-status-pending-fill text-status-pending-text border border-status-pending-border': status === 'PENDING_APPROVAL',
          'bg-status-approved-fill text-status-approved-text border border-status-approved-border': status === 'APPROVED',
          'bg-status-rejected-fill text-status-rejected-text border border-status-rejected-border': status === 'REJECTED',
        },
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full mr-1.5", {
          'bg-status-draft-solid': status === 'DRAFT',
          'bg-status-pending-solid': status === 'PENDING_APPROVAL',
          'bg-status-approved-solid': status === 'APPROVED',
          'bg-status-rejected-solid': status === 'REJECTED',
        })}
      />
      {status.replace('_', ' ')}
    </div>
  );
};
