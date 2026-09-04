# Assumptions

1. **Workflow Transitions**: Vouchers follow a strict linear progression. Once a voucher is `APPROVED` or `REJECTED`, it reaches a terminal state and cannot be reverted to `DRAFT`.
2. **Audit Logging**: The "Submitted" action is not a voucher status itself, but an event logged into a separate timeline/audit table when a voucher transitions from `DRAFT` to `PENDING_APPROVAL`.
3. **Approval Chain**: The Director can view and approve/reject every voucher company-wide. There is no department-based approval scoping.
4. **Signatures**: User signatures will be uploaded and stored locally in the `server/uploads/signatures/` folder outside the public path. They are served via an authenticated API endpoint, NEVER statically.
5. **No External Dependencies**: Authentication uses local JWTs (no Auth0/Cognito), and data storage uses local PostgreSQL (no Supabase/RDS).
6. **Role Definitions**: User roles are hardcoded to `EMPLOYEE`, `DIRECTOR`, and `ACCOUNTS`. Each user belongs to exactly one role. We will seed fictitious demo accounts for these roles; no public registration exists.
7. **No Line Items / Receipts**: Each voucher has a single total amount, category, and description. Uploads are strictly for employee/director signatures; there is no receipt upload capability.
