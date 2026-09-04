import { prisma } from '../../lib/prisma';
import { Status, Role } from '@prisma/client';
import { AuthPayload } from '../../middleware/authenticate';

export class DashboardService {
  static async getEmployeeStats(userId: string) {
    const [total, draft, pending, approved, rejected, sumResult] = await Promise.all([
      prisma.voucher.count({ where: { employeeId: userId } }),
      prisma.voucher.count({ where: { employeeId: userId, status: Status.DRAFT } }),
      prisma.voucher.count({ where: { employeeId: userId, status: Status.PENDING_APPROVAL } }),
      prisma.voucher.count({ where: { employeeId: userId, status: Status.APPROVED } }),
      prisma.voucher.count({ where: { employeeId: userId, status: Status.REJECTED } }),
      prisma.voucher.aggregate({
        _sum: { amount: true },
        where: { employeeId: userId, status: { not: Status.DRAFT } }
      })
    ]);

    return {
      total,
      draft,
      pending,
      approved,
      rejected,
      totalAmountClaimed: Number(sumResult._sum.amount || 0)
    };
  }

  static async getDirectorStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingApprovalCount, approvedToday, rejectedToday, sumResult, recentActivity] = await Promise.all([
      prisma.voucher.count({ where: { status: Status.PENDING_APPROVAL } }),
      prisma.voucher.count({ where: { status: Status.APPROVED, approvedAt: { gte: today } } }),
      prisma.voucher.count({ where: { status: Status.REJECTED, updatedAt: { gte: today } } }), // Assumes rejection updates updatedAt
      prisma.voucher.aggregate({
        _sum: { amount: true },
        where: { status: Status.PENDING_APPROVAL }
      }),
      prisma.voucherEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { email: true } }, voucher: { select: { voucherNumber: true } } }
      })
    ]);

    return {
      pendingApprovalCount,
      approvedToday,
      rejectedToday,
      totalPendingAmount: Number(sumResult._sum.amount || 0),
      recentActivity
    };
  }

  static async getAccountsStats() {
    const [total, pending, approved, rejected, sumResult, recentApprovedVouchers] = await Promise.all([
      prisma.voucher.count(),
      prisma.voucher.count({ where: { status: Status.PENDING_APPROVAL } }),
      prisma.voucher.count({ where: { status: Status.APPROVED } }),
      prisma.voucher.count({ where: { status: Status.REJECTED } }),
      prisma.voucher.aggregate({
        _sum: { amount: true },
        where: { status: Status.APPROVED }
      }),
      prisma.voucher.findMany({
        where: { status: Status.APPROVED },
        take: 5,
        orderBy: { approvedAt: 'desc' },
        include: { employee: { select: { email: true } } }
      })
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      totalApprovedAmount: Number(sumResult._sum.amount || 0),
      recentApprovedVouchers
    };
  }

  static async getStats(user: AuthPayload) {
    switch (user.role) {
      case Role.EMPLOYEE:
        return this.getEmployeeStats(user.id);
      case Role.DIRECTOR:
        return this.getDirectorStats();
      case Role.ACCOUNTS:
        return this.getAccountsStats();
      default:
        throw { statusCode: 403, code: 'FORBIDDEN', message: 'Unknown role' };
    }
  }
}
