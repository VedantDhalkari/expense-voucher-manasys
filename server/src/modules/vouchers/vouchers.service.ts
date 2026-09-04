import { prisma } from '../../lib/prisma';
import { Status, Role, Prisma } from '@prisma/client';
import { CreateVoucherInput, UpdateVoucherInput, QueryVoucherInput } from './vouchers.schema';
import fs from 'fs';
import path from 'path';
import { AuthPayload } from '../../middleware/authenticate';

export class VouchersService {
  private static UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/signatures');

  private static async generateVoucherNumber(): Promise<string> {
    const res = await prisma.$queryRaw<{nextval: bigint}[]>`SELECT nextval('voucher_number_seq')`;
    const seq = Number(res[0].nextval);
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const seqStr = String(seq).padStart(6, '0');
    return `EV-${dateStr}-${seqStr}`;
  }

  static async create(data: CreateVoucherInput, user: AuthPayload) {
    if (user.role !== Role.EMPLOYEE) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Only employees can create vouchers' };
    }
    const voucherNumber = await this.generateVoucherNumber();

    return prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.create({
        data: {
          ...data,
          voucherNumber,
          voucherDate: new Date(),
          employeeId: user.id,
          status: Status.DRAFT,
        }
      });
      
      await tx.voucherEvent.create({
        data: {
          voucherId: voucher.id,
          actorId: user.id,
          action: 'CREATED',
          newStatus: Status.DRAFT,
          note: 'Voucher drafted',
        }
      });

      return voucher;
    });
  }
  
  static async list(query: QueryVoucherInput, user: AuthPayload) {
    const where: Prisma.VoucherWhereInput = {};
    
    if (user.role === Role.EMPLOYEE) {
      where.employeeId = user.id;
    }
    
    if (query.search) {
      if (user.role !== Role.EMPLOYEE) {
         where.OR = [
           { voucherNumber: { contains: query.search, mode: 'insensitive' } },
           { employee: { email: { contains: query.search, mode: 'insensitive' } } }
         ];
      } else {
         where.voucherNumber = { contains: query.search, mode: 'insensitive' };
      }
    }
    
    if (query.department) where.department = query.department;
    if (query.expenseCategory) where.expenseCategory = query.expenseCategory;
    if (query.status) where.status = query.status;
    
    if (query.dateFrom || query.dateTo) {
      where.expenseDate = {};
      if (query.dateFrom) where.expenseDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.expenseDate.lte = new Date(query.dateTo);
    }
    
    if (query.amountMin !== undefined || query.amountMax !== undefined) {
      where.amount = {};
      if (query.amountMin !== undefined) where.amount.gte = query.amountMin;
      if (query.amountMax !== undefined) where.amount.lte = query.amountMax;
    }
    
    const skip = (query.page - 1) * query.pageSize;
    
    const [total, items] = await Promise.all([
      prisma.voucher.count({ where }),
      prisma.voucher.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: { employee: { select: { email: true } }, director: { select: { email: true } } }
      })
    ]);
    
    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize)
    };
  }

  static async getById(id: string, user: AuthPayload) {
    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        employee: { select: { email: true, id: true } },
        director: { select: { email: true, id: true } },
        events: { orderBy: { createdAt: 'desc' }, include: { actor: { select: { email: true } } } }
      }
    });
    
    if (!voucher) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Voucher not found' };
    }
    
    if (user.role === Role.EMPLOYEE && voucher.employeeId !== user.id) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Access denied' };
    }
    
    return voucher;
  }

  static async update(id: string, data: UpdateVoucherInput, user: AuthPayload) {
    const voucher = await this.getById(id, user);
    
    if (voucher.status !== Status.DRAFT) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Only DRAFT vouchers can be modified' };
    }
    
    return prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { id },
        data
      });
      
      await tx.voucherEvent.create({
        data: {
          voucherId: id,
          actorId: user.id,
          action: 'UPDATED',
          note: 'Voucher details updated',
        }
      });
      return updated;
    });
  }

  static async delete(id: string, user: AuthPayload) {
    const voucher = await this.getById(id, user);
    
    if (voucher.status !== Status.DRAFT) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Only DRAFT vouchers can be deleted' };
    }
    
    if (voucher.employeeSignatureKey) {
      const filePath = path.join(this.UPLOAD_DIR, voucher.employeeSignatureKey);
      await fs.promises.unlink(filePath).catch(() => {});
    }
    
    await prisma.voucherEvent.deleteMany({ where: { voucherId: id } });
    await prisma.voucher.delete({ where: { id } });
    
    return { success: true };
  }
  
  static async updateEmployeeSignature(id: string, key: string, user: AuthPayload) {
    const voucher = await this.getById(id, user);
    if (voucher.status !== Status.DRAFT) {
      const filePath = path.join(this.UPLOAD_DIR, key);
      await fs.promises.unlink(filePath).catch(() => {});
      throw { statusCode: 409, code: 'CONFLICT', message: 'Only DRAFT vouchers can receive a signature upload' };
    }

    if (voucher.employeeSignatureKey) {
      const oldPath = path.join(this.UPLOAD_DIR, voucher.employeeSignatureKey);
      await fs.promises.unlink(oldPath).catch(() => {});
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { id },
        data: { employeeSignatureKey: key }
      });
      await tx.voucherEvent.create({
        data: {
          voucherId: id,
          actorId: user.id,
          action: 'SIGNATURE_UPLOADED',
          note: 'Employee signature uploaded',
        }
      });
      return updated;
    });
  }
  
  static async submit(id: string, user: AuthPayload) {
    const voucher = await this.getById(id, user);
    
    if (voucher.status !== Status.DRAFT) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Only DRAFT vouchers can be submitted' };
    }
    
    if (!voucher.employeeSignatureKey) {
      throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Employee signature is required to submit' };
    }
    
    return prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { id },
        data: { status: Status.PENDING_APPROVAL }
      });
      
      await tx.voucherEvent.create({
        data: {
          voucherId: id,
          actorId: user.id,
          action: 'SUBMITTED',
          previousStatus: Status.DRAFT,
          newStatus: Status.PENDING_APPROVAL,
          note: 'Voucher submitted for approval',
        }
      });
      return updated;
    });
  }
  
  static async approve(id: string, key: string, user: AuthPayload) {
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
       const filePath = path.join(this.UPLOAD_DIR, key);
       await fs.promises.unlink(filePath).catch(() => {});
       throw { statusCode: 404, code: 'NOT_FOUND', message: 'Voucher not found' };
    }
    
    if (voucher.status !== Status.PENDING_APPROVAL) {
      const filePath = path.join(this.UPLOAD_DIR, key);
      await fs.promises.unlink(filePath).catch(() => {});
      throw { statusCode: 409, code: 'CONFLICT', message: 'Only PENDING_APPROVAL vouchers can be approved' };
    }
    
    return prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { id },
        data: { 
           status: Status.APPROVED, 
           approvedBy: user.id, 
           approvedAt: new Date(),
           directorSignatureKey: key 
        }
      });
      
      await tx.voucherEvent.create({
        data: {
          voucherId: id,
          actorId: user.id,
          action: 'APPROVED',
          previousStatus: Status.PENDING_APPROVAL,
          newStatus: Status.APPROVED,
          note: 'Voucher approved',
        }
      });
      return updated;
    });
  }
  
  static async reject(id: string, reason: string, user: AuthPayload) {
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Voucher not found' };
    
    if (voucher.status !== Status.PENDING_APPROVAL) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Only PENDING_APPROVAL vouchers can be rejected' };
    }
    
    return prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { id },
        data: { 
           status: Status.REJECTED, 
           rejectionReason: reason 
        }
      });
      
      await tx.voucherEvent.create({
        data: {
          voucherId: id,
          actorId: user.id,
          action: 'REJECTED',
          previousStatus: Status.PENDING_APPROVAL,
          newStatus: Status.REJECTED,
          note: reason,
        }
      });
      return updated;
    });
  }

  static async getSignaturePath(id: string, type: 'employee' | 'director', user: AuthPayload) {
    const voucher = await this.getById(id, user); 
    
    const key = type === 'employee' ? voucher.employeeSignatureKey : voucher.directorSignatureKey;
    if (!key) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Signature not found' };
    }
    
    const filePath = path.join(this.UPLOAD_DIR, key);
    if (!filePath.startsWith(this.UPLOAD_DIR)) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Invalid path' };
    }
    
    return filePath;
  }
}
