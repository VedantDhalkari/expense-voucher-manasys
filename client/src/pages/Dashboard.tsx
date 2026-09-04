import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { MetricCard } from '../components/ui/MetricCard';
import { formatCurrency } from '../lib/utils';
import { DollarSign, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Timeline } from '../components/ui/Timeline';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchApi<any>('/dashboard'),
  });

  if (isLoading) return <div className="p-8 text-center text-brand-slate">Loading dashboard...</div>;
  if (error || !data) return <div className="p-8 text-center text-status-rejected-solid">Error loading dashboard</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-brand-navy">
          Welcome back, {user?.email.split('@')[0]}
        </h1>
      </div>

      {user?.role === 'EMPLOYEE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Claimed (Approved/Pending)" value={formatCurrency(data.totalAmountClaimed)} icon={DollarSign} />
          <MetricCard title="Drafts" value={data.draft} icon={FileText} />
          <MetricCard title="Pending Approval" value={data.pending} icon={Clock} trendPositive={undefined} />
          <MetricCard title="Approved" value={data.approved} icon={CheckCircle} trendPositive={true} />
        </div>
      )}

      {user?.role === 'DIRECTOR' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Pending Approvals" value={data.pendingApprovalCount} icon={AlertCircle} trendPositive={false} />
            <MetricCard title="Total Pending Amount" value={formatCurrency(data.totalPendingAmount)} icon={DollarSign} />
            <MetricCard title="Approved Today" value={data.approvedToday} icon={CheckCircle} trendPositive={true} />
            <MetricCard title="Rejected Today" value={data.rejectedToday} icon={XCircle} trendPositive={false} />
          </div>
          
          <div className="bg-white rounded-lg border border-brand-border p-6 shadow-level-1">
            <h2 className="text-lg font-bold font-heading text-brand-navy mb-6">Recent Team Activity</h2>
            <Timeline events={data.recentActivity || []} />
          </div>
        </div>
      )}

      {user?.role === 'ACCOUNTS' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Approved Volume" value={formatCurrency(data.totalApprovedAmount)} icon={DollarSign} trendPositive={true} />
            <MetricCard title="Pending Vouchers" value={data.pending} icon={Clock} />
            <MetricCard title="Approved Vouchers" value={data.approved} icon={CheckCircle} />
            <MetricCard title="Rejected Vouchers" value={data.rejected} icon={XCircle} />
          </div>
        </div>
      )}
    </div>
  );
};
