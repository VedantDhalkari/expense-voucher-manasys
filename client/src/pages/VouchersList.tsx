import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from '../components/ui/DataTable';
import type { VoucherStatus } from '../components/ui/StatusBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const VouchersList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<VoucherStatus | ''>('');
  const [search, setSearch] = useState('');

  // When filters change, reset to page 1
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as VoucherStatus | '');
    setPage(1);
  };

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: '10',
    ...(status && { status }),
    ...(search && { search }),
  });

  const { data, isLoading } = useQuery<any>({
    queryKey: ['vouchers', page, status, search],
    queryFn: () => fetchApi(`/vouchers?${queryParams.toString()}`),
    placeholderData: keepPreviousData,
  });

  const columns = [
    {
      key: 'voucherNumber',
      header: 'Voucher Number',
      render: (row: any) => <span className="font-bold">{row.voucherNumber}</span>,
    },
    {
      key: 'expenseDate',
      header: 'Expense Date',
      render: (row: any) => format(new Date(row.expenseDate), 'dd MMM yyyy'),
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (row: any) => row.employee?.email.split('@')[0],
    },
    {
      key: 'department',
      header: 'Department',
      render: (row: any) => row.department,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right' as const,
      render: (row: any) => <span className="tnum">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right' as const,
      render: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-heading text-brand-navy">Vouchers Registry</h1>
        {user?.role === 'EMPLOYEE' && (
          <Button onClick={() => navigate('/employee/vouchers/new')}>Create Voucher</Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg border border-brand-border shadow-level-1 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <Input 
            placeholder="Search voucher or employee..." 
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            className="flex h-10 w-full rounded-[6px] border border-brand-borderAccent bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action/20 focus-visible:border-brand-action"
            value={status}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.items || []} 
        isLoading={isLoading} 
        onRowClick={(row) => navigate(`/${user?.role.toLowerCase()}/vouchers/${row.id}`)}
      />
      
      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-brand-border rounded-lg shadow-level-1">
          <div className="text-sm text-slate-500">
            Showing page <span className="font-medium text-brand-navy">{data.page}</span> of <span className="font-medium text-brand-navy">{data.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={page === data.totalPages} 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
