import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { SignatureUpload } from '../components/ui/SignatureUpload';
import { Timeline } from '../components/ui/Timeline';

export const VoucherDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [sigFile, setSigFile] = useState<File | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['voucher', id],
    queryFn: () => fetchApi(`/vouchers/${id}`).then(d => d.voucher),
  });

  const uploadEmployeeSigMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('signature', file);
      return fetchApi(`/vouchers/${id}/employee-signature`, { method: 'POST', body: fd });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['voucher', id] })
  });

  const submitMutation = useMutation({
    mutationFn: () => fetchApi(`/vouchers/${id}/submit`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['voucher', id] })
  });

  const approveMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('signature', file);
      return fetchApi(`/vouchers/${id}/approve`, { method: 'POST', body: fd });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher', id] });
      setShowApproveModal(false);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => fetchApi(`/vouchers/${id}/reject`, { 
      method: 'POST', 
      body: JSON.stringify({ rejectionReason: rejectReason }) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher', id] });
      setShowRejectModal(false);
    }
  });

  if (isLoading || !data) return <div className="p-8 text-center">Loading...</div>;

  const isDraft = data.status === 'DRAFT';
  const isPending = data.status === 'PENDING_APPROVAL';
  const canEdit = user?.role === 'EMPLOYEE' && isDraft;
  const canApprove = user?.role === 'DIRECTOR' && isPending;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-brand-navy flex items-center gap-3">
            {data.voucherNumber}
            <StatusBadge status={data.status} />
          </h1>
          <p className="text-sm text-brand-slate mt-1">Submitted by {data.employee.email.split('@')[0]}</p>
        </div>
        
        {canEdit && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(`/employee/vouchers/${id}/edit`)}>Edit Details</Button>
            <Button 
              onClick={() => submitMutation.mutate()} 
              disabled={!data.employeeSignatureKey || submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        )}

        {canApprove && (
          <div className="flex gap-3">
            <Button variant="destructive" onClick={() => setShowRejectModal(true)}>Reject</Button>
            <Button variant="success" onClick={() => setShowApproveModal(true)}>Approve Voucher</Button>
          </div>
        )}
      </div>

      {data.rejectionReason && (
        <div className="bg-status-rejected-fill border border-status-rejected-border rounded-lg p-4 flex gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-status-rejected-text uppercase tracking-widest">Rejection Reason</h3>
            <p className="text-sm text-status-rejected-solid mt-1 font-medium">{data.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-brand-border rounded-lg shadow-level-1 overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border bg-brand-surface">
              <h2 className="text-sm font-bold font-heading text-brand-navy">Expense Details</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Title</div>
                <div className="text-sm font-medium text-brand-navy">{data.expenseTitle}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</div>
                <div className="text-xl font-bold font-heading text-brand-navy tnum">{formatCurrency(data.amount)}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date</div>
                <div className="text-sm font-medium text-brand-navy">{format(new Date(data.expenseDate), 'dd MMM yyyy')}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Department</div>
                <div className="text-sm font-medium text-brand-navy">{data.department}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Category</div>
                <div className="text-sm font-medium text-brand-navy">{data.expenseCategory}</div>
              </div>
              {data.expenseDescription && (
                <div className="col-span-2 mt-2 pt-4 border-t border-brand-border">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description</div>
                  <div className="text-sm text-brand-slate leading-relaxed">{data.expenseDescription}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-lg shadow-level-1 overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border bg-brand-surface">
              <h2 className="text-sm font-bold font-heading text-brand-navy">Signatures</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Employee Signature */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employee Signature</div>
                {canEdit ? (
                  <SignatureUpload 
                    onFileSelect={(f) => { if(f) uploadEmployeeSigMutation.mutate(f) }} 
                  />
                ) : data.employeeSignatureKey ? (
                  <div className="h-[140px] border border-brand-border rounded-lg bg-slate-50 p-2 flex items-center justify-center">
                    <img src={`/api/vouchers/${id}/signatures/employee`} alt="Employee Signature" className="max-h-full object-contain mix-blend-multiply" />
                  </div>
                ) : (
                  <div className="h-[140px] border border-dashed border-brand-borderAccent rounded-lg bg-brand-surface flex items-center justify-center text-slate-400 text-sm">
                    No signature
                  </div>
                )}
              </div>

              {/* Director Signature */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Director Signature</div>
                {data.directorSignatureKey ? (
                  <div className="h-[140px] border border-brand-border rounded-lg bg-slate-50 p-2 flex items-center justify-center">
                    <img src={`/api/vouchers/${id}/signatures/director`} alt="Director Signature" className="max-h-full object-contain mix-blend-multiply" />
                  </div>
                ) : (
                  <div className="h-[140px] border border-dashed border-brand-borderAccent rounded-lg bg-brand-surface flex items-center justify-center text-slate-400 text-sm">
                    Pending
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Audit Timeline */}
        <div className="bg-white border border-brand-border rounded-lg shadow-level-1 h-fit">
          <div className="px-6 py-4 border-b border-brand-border bg-brand-surface">
            <h2 className="text-sm font-bold font-heading text-brand-navy">Audit Timeline</h2>
          </div>
          <div className="p-6">
            <Timeline events={data.events} />
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-level-3 border border-slate-400 w-full max-w-[480px] overflow-hidden">
            <div className="px-6 py-5 border-b border-brand-border bg-status-approved-fill flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-status-approved-solid text-white flex items-center justify-center">✓</div>
              <h2 className="text-lg font-bold font-heading text-status-approved-text">Approve Voucher</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-brand-slate">
                You are approving the voucher <span className="font-bold">{data.voucherNumber}</span> for <span className="font-bold">{formatCurrency(data.amount)}</span>.
              </p>
              <SignatureUpload 
                selectedFile={sigFile} 
                onFileSelect={setSigFile} 
                error={approveMutation.isError ? (approveMutation.error as any).message : ''}
              />
              <div className="pt-4 flex justify-end gap-3 border-t border-brand-border">
                <Button variant="secondary" onClick={() => { setShowApproveModal(false); setSigFile(null); }}>Cancel</Button>
                <Button variant="success" disabled={!sigFile || approveMutation.isPending} onClick={() => approveMutation.mutate(sigFile!)}>
                  {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-level-3 border border-slate-400 w-full max-w-[480px] overflow-hidden">
            <div className="px-6 py-5 border-b border-brand-border bg-status-rejected-fill">
              <h2 className="text-lg font-bold font-heading text-status-rejected-text">Reject Voucher</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-brand-slate block">Reason for Rejection *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex w-full rounded-[6px] border border-brand-borderAccent bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-rejected-solid/20 focus-visible:border-status-rejected-solid min-h-[100px] resize-y"
                  placeholder="Provide a mandatory reason for returning this voucher..."
                />
              </div>
              {rejectMutation.isError && (
                <p className="text-xs text-status-rejected-solid">{(rejectMutation.error as any).message}</p>
              )}
              <div className="pt-4 flex justify-end gap-3 border-t border-brand-border">
                <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                <Button variant="destructive" disabled={!rejectReason.trim() || rejectMutation.isPending} onClick={() => rejectMutation.mutate()}>
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Voucher'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
