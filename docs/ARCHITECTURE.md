# System Architecture

## Overview
The Expense Voucher Management System is a rigid, corporate financial tool built to ensure auditability and precision. It leverages a modern React frontend and a Node.js/Express backend, strictly bound to local environments for storage and databases.

## Technology Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: Vanilla CSS (Strict adherence to Stitch 'Corporate Precision Finance' design system, no Tailwind)
- **Backend**: Node.js + Express + TypeScript
- **Database**: Local PostgreSQL (`expense_voucher_db`)
- **ORM**: Prisma 7

## Database & Security Constraints
- **Role**: Connections must use the PostgreSQL role `expense_app`.
- **Authentication**: Stateless JWT authentication stored exclusively in **HTTP-only cookies** to prevent XSS exfiltration.
- **File Storage**: Local file system only. Signatures must be stored in `server/uploads/signatures/` outside the public root. They are served only via authenticated and authorized API endpoints.
- **Prohibited Tech**: Supabase, Docker, external Cloud databases, third-party authentication services, external storage (S3), or express.static for sensitive files.
- **Secrets Management**: No JWT secrets, DB passwords, or uploaded signatures are ever committed to Git.

## User Roles
1. **EMPLOYEE**: Can create DRAFT vouchers, edit them, and submit them for approval.
2. **DIRECTOR**: Can view PENDING_APPROVAL vouchers company-wide, review details, and either approve or reject them.
3. **ACCOUNTS**: Can view all vouchers (Registry) and dashboards for financial reconciliation.

## State Machine (Voucher Workflow)
The voucher lifecycle is strictly controlled:
`DRAFT` → `PENDING_APPROVAL` → `APPROVED` | `REJECTED`

*Note: "Submitted" is an event in the audit timeline, not a permanent workflow status.*

## Directory Structure Strategy
- `client/`: React Single Page Application.
- `server/`: Express API, Prisma schemas and migrations, secure file endpoints.
- `docs/`: Technical specifications and maps.
