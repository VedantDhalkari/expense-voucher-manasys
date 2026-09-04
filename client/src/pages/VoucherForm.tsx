import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const voucherSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  expenseTitle: z.string().min(1, 'Title is required'),
  expenseCategory: z.string().min(1, 'Category is required'),
  expenseDate: z.string().min(1, 'Expense Date is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  expenseDescription: z.string().optional(),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

export const VoucherForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: voucher, isLoading: isFetching } = useQuery({
    queryKey: ['voucher', id],
    queryFn: () => fetchApi(`/vouchers/${id}`).then(d => d.voucher),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
  });

  useEffect(() => {
    if (voucher) {
      reset({
        department: voucher.department,
        expenseTitle: voucher.expenseTitle,
        expenseCategory: voucher.expenseCategory,
        expenseDate: voucher.expenseDate.split('T')[0], // yyyy-mm-dd format for input type="date"
        amount: Number(voucher.amount),
        expenseDescription: voucher.expenseDescription || '',
      });
    }
  }, [voucher, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // transform date back to ISO
      const payload = { ...data, expenseDate: new Date(data.expenseDate).toISOString() };
      return isEdit
        ? fetchApi(`/vouchers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : fetchApi(`/vouchers`, { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      const returnId = isEdit ? id : data.voucher.id;
      navigate(`/employee/vouchers/${returnId}`);
    }
  });

  if (isEdit && isFetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-heading text-brand-navy">
        {isEdit ? 'Edit Draft Voucher' : 'Create New Voucher'}
      </h1>

      <div className="bg-white p-6 rounded-lg border border-brand-border shadow-level-1">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Department"
              {...register('department')}
              error={errors.department?.message}
              placeholder="e.g. IT, Marketing"
            />
            <Input
              label="Expense Category"
              {...register('expenseCategory')}
              error={errors.expenseCategory?.message}
              placeholder="e.g. Travel, Software"
            />
            <Input
              label="Expense Title"
              {...register('expenseTitle')}
              error={errors.expenseTitle?.message}
              className="md:col-span-2"
              placeholder="Brief summary of the expense"
            />
            <Input
              label="Expense Date"
              type="date"
              {...register('expenseDate')}
              error={errors.expenseDate?.message}
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              currency
              {...register('amount')}
              error={errors.amount?.message}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-brand-slate block">Description (Optional)</label>
            <textarea
              {...register('expenseDescription')}
              className="flex w-full rounded-[6px] border border-brand-borderAccent bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action/20 focus-visible:border-brand-action min-h-[100px] resize-y"
              placeholder="Provide additional details if necessary"
            />
          </div>

          {mutation.isError && (
            <div className="p-3 bg-status-rejected-fill text-status-rejected-solid rounded-md text-sm border border-status-rejected-border">
              {(mutation.error as any).message || 'Failed to save voucher'}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Draft')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
