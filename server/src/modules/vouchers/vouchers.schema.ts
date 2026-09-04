import { z } from 'zod';
import { Status } from '@prisma/client';

export const createVoucherSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  expenseTitle: z.string().min(1, 'Title is required'),
  expenseCategory: z.string().min(1, 'Category is required'),
  expenseDate: z.string().datetime({ message: 'Must be a valid ISO date string' }),
  expenseDescription: z.string().optional(),
  amount: z.number().positive('Amount must be greater than zero'),
});

export const updateVoucherSchema = createVoucherSchema.partial();

export const rejectVoucherSchema = z.object({
  rejectionReason: z.string().trim().min(1, 'Rejection reason is required'),
});

const sortableFields = ['createdAt', 'expenseDate', 'amount', 'voucherNumber', 'status'] as const;

export const queryVoucherSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  department: z.string().optional(),
  expenseCategory: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  amountMin: z.coerce.number().min(0).optional(),
  amountMax: z.coerce.number().min(0).optional(),
  sortBy: z.enum(sortableFields).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type RejectVoucherInput = z.infer<typeof rejectVoucherSchema>;
export type QueryVoucherInput = z.infer<typeof queryVoucherSchema>;
