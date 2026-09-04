# Assumptions

1. **Workflow Transitions**: Vouchers follow a strict linear progression. Once a voucher is `APPROVED` or `REJECTED`, it reaches a terminal state and cannot be reverted to `DRAFT`.
2. **Audit Logging**: The "Submitted" action is not a voucher status itself, but an event logged into a separate timeline/audit table when a voucher transitions from `DRAFT` to `PENDING_APPROVAL`.
3. **Approval Chain**: The current requirement implies a single-tier approval process (Director approves/rejects). Multi-tiered approvals (e.g., Manager -> Director -> VP) are out of scope for this MVP.
4. **Signatures**: User signatures will be uploaded and stored locally in the `server/uploads/signatures/` folder. They are static assets served by the Node.js backend.
5. **No External Dependencies**: Authentication uses local JWTs (no Auth0/Cognito), and data storage uses local PostgreSQL (no Supabase/RDS).
6. **Role Definitions**: User roles are hardcoded to `EMPLOYEE`, `DIRECTOR`, and `ACCOUNTS`. Each user belongs to exactly one role.
