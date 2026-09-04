ALTER TABLE "Voucher" DROP CONSTRAINT "voucher_rejection_check";
ALTER TABLE "Voucher" ADD CONSTRAINT "voucher_rejection_check" CHECK (status != 'REJECTED' OR ("rejectionReason" IS NOT NULL AND length(trim("rejectionReason")) > 0));
