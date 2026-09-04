-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "voucherDate" TIMESTAMP(3) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "expenseTitle" TEXT NOT NULL,
    "expenseCategory" TEXT NOT NULL,
    "expenseDescription" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "employeeSignatureKey" TEXT,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "directorSignatureKey" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherEvent" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousStatus" "Status",
    "newStatus" "Status",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_voucherNumber_key" ON "Voucher"("voucherNumber");

-- CreateIndex
CREATE INDEX "Voucher_voucherNumber_idx" ON "Voucher"("voucherNumber");

-- CreateIndex
CREATE INDEX "Voucher_employeeId_idx" ON "Voucher"("employeeId");

-- CreateIndex
CREATE INDEX "Voucher_status_idx" ON "Voucher"("status");

-- CreateIndex
CREATE INDEX "Voucher_expenseDate_idx" ON "Voucher"("expenseDate");

-- CreateIndex
CREATE INDEX "Voucher_department_idx" ON "Voucher"("department");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherEvent" ADD CONSTRAINT "VoucherEvent_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherEvent" ADD CONSTRAINT "VoucherEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "Voucher" ADD CONSTRAINT "voucher_amount_check" CHECK (amount > 0);
ALTER TABLE "Voucher" ADD CONSTRAINT "voucher_employee_sig_check" CHECK (status = 'DRAFT' OR "employeeSignatureKey" IS NOT NULL);
ALTER TABLE "Voucher" ADD CONSTRAINT "voucher_director_sig_check" CHECK (status != 'APPROVED' OR ("directorSignatureKey" IS NOT NULL AND "approvedAt" IS NOT NULL));
ALTER TABLE "Voucher" ADD CONSTRAINT "voucher_rejection_check" CHECK (status != 'REJECTED' OR "rejectionReason" IS NOT NULL);
