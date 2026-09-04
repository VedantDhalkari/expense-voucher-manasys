# ExpenseFlow — Expense Voucher Management System

> A secure, role-based expense reimbursement workflow built to replace manual voucher creation, approval, and tracking.

ExpenseFlow enables employees to submit expense vouchers, Directors to approve or reject them, and Accounts teams to monitor reimbursement-ready records—while preserving a complete audit trail and protecting signature files.

**Built with React, Node.js, Express, PostgreSQL, Prisma, and TypeScript.**

---

## Reviewer Quick Start

```text
1. Create two local PostgreSQL databases
2. Configure server/.env
3. Run migrations and seed demo users
4. Start the API and React app
5. Login using a seeded role
```

```powershell
# Terminal 1 — API
cd server
npm install
npm run prisma:generate
npm run db:migrate:apply
npm run db:seed
npm run dev
```

```powershell
# Terminal 2 — React client
cd client
npm install
npm run dev
```

Open: `http://localhost:5173`

> [!NOTE]
> This project intentionally runs locally. No cloud deployment, Supabase project, Docker setup, or external authentication provider is required.

---

## The Problem

Manual expense vouchers are slow to process, difficult to track, and vulnerable to missing information or unauthorized changes.

ExpenseFlow introduces a controlled workflow:

```mermaid
flowchart LR
    A[Employee creates Draft] --> B[Employee uploads signature]
    B --> C[Submit voucher]
    C --> D[Pending Approval]
    D -->|Approve with Director signature| E[Approved]
    D -->|Reject with reason| F[Rejected]
    E --> G[Accounts reviews reimbursement-ready voucher]
```

The system prevents users from bypassing workflow rules, editing submitted vouchers, approving their own requests, or viewing unauthorized data.

---

## Key Features

| Area | Capability |
|---|---|
| Authentication | JWT authentication stored in HTTP-only cookies |
| Authorization | Strict Employee, Director, and Accounts role access |
| Voucher workflow | Draft → Pending Approval → Approved or Rejected |
| Employee tools | Create, edit, delete drafts, upload signature, submit, track status |
| Director tools | Review all vouchers, approve with signature, reject with reason |
| Accounts tools | Read-only access to all vouchers, statuses, audit timeline, and signatures |
| Search and filters | Voucher number, employee, department, category, status, date, and amount |
| Audit trail | Tracks creation, edits, submission, signatures, approval, and rejection |
| File security | Private local signature files served only through authorized API routes |
| Data integrity | PostgreSQL constraints, exact decimal money values, foreign keys, indexes, and migrations |

---

## Architecture

```mermaid
flowchart TB
    Browser[React + Vite Client<br/>localhost:5173]
    API[Express API<br/>localhost:3000]
    DB[(PostgreSQL<br/>expense_voucher_db)]
    Files[Private Local Signature Storage<br/>server/uploads/signatures]

    Browser -->|Relative /api requests<br/>credentials included| API
    API -->|Prisma ORM| DB
    API -->|Authorized read/write only| Files
```

### Core principles

- The frontend improves usability; the backend enforces security.
- A role is never trusted from the browser request.
- An Employee ID is always derived from the authenticated session.
- Submitted, approved, and rejected vouchers are immutable to Employees.
- Signature files are never publicly exposed through a static folder.
- Money is stored as PostgreSQL `NUMERIC(12,2)`, never JavaScript floating-point values.

---

## Role Permissions

| Action | Employee | Director | Accounts |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Create voucher | ✅ | ❌ | ❌ |
| Edit/Delete Draft | ✅ Own drafts only | ❌ | ❌ |
| View own vouchers | ✅ | ✅ | ✅ |
| View all vouchers | ❌ | ✅ | ✅ |
| Submit voucher | ✅ Own drafts only | ❌ | ❌ |
| Approve voucher | ❌ | ✅ Pending only | ❌ |
| Reject voucher | ❌ | ✅ Pending only | ❌ |
| View signatures | ✅ Own vouchers | ✅ | ✅ |
| Process reimbursement view | ❌ | ❌ | ✅ |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Frontend state | TanStack Query, React Context |
| Forms | React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 18 |
| ORM and migrations | Prisma 7 |
| Authentication | JWT, bcrypt, HTTP-only cookies |
| Uploads | Multer, file-type magic-byte validation |
| Testing | Integration scripts, TypeScript type checks |
| UI design | Google Stitch design system via Stitch MCP |

---

## Project Setup Instructions

### Prerequisites

Install:

- Node.js 24 LTS or newer
- PostgreSQL 18
- Git
- A modern browser

Verify installation:

```powershell
node --version
npm --version
git --version
```

### 1. Clone the repository

```powershell
git clone https://github.com/VedantDhalkari/expense-voucher-manasys.git
cd expense-voucher-manasys
```

### 2. Create local PostgreSQL databases

Open PostgreSQL as the administrator:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d postgres
```

Run the following SQL. Replace the password placeholder with your own long local password.

```sql
CREATE ROLE expense_app
  WITH LOGIN PASSWORD 'your-long-local-password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE;

CREATE DATABASE expense_voucher_db OWNER expense_app;

CREATE DATABASE expense_voucher_shadow OWNER expense_app;
```

Exit PostgreSQL:

```sql
\q
```

> [!IMPORTANT]
> `expense_voucher_shadow` is used only by Prisma during development to validate migration history. Never point `SHADOW_DATABASE_URL` at the real `expense_voucher_db` database.

### 3. Configure environment variables

```powershell
cd server
Copy-Item .env.example .env
notepad .env
```

Set the values in `server/.env`:

```env
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

DATABASE_URL="postgresql://expense_app:YOUR_DATABASE_PASSWORD@localhost:5432/expense_voucher_db?schema=public"
SHADOW_DATABASE_URL="postgresql://expense_app:YOUR_DATABASE_PASSWORD@localhost:5432/expense_voucher_shadow?schema=public"

JWT_SECRET="replace-with-a-long-random-secret"
DEMO_USER_PASSWORD="replace-with-a-local-demo-login-password"
```

Generate a secure JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Never commit `server/.env`.

### 4. Install dependencies and prepare the database

```powershell
cd server
npm install
npm run prisma:generate
npm run db:migrate:apply
npm run db:seed
npm run db:status
```

### 5. Start the backend

```powershell
cd server
npm run dev
```

The API starts at:

```text
http://localhost:3000
```

### 6. Start the frontend

Open another terminal:

```powershell
cd client
npm install
npm run dev
```

The application starts at:

```text
http://localhost:5173
```

---

## Demo Accounts

All seeded local accounts use the value configured in `DEMO_USER_PASSWORD`.

| Role | Email |
|---|---|
| Employee | `employee@expenseflow.com` |
| Director | `director@expenseflow.com` |
| Accounts | `accounts@expenseflow.com` |

> [!CAUTION]
> These are fictitious development users. Never use real employee information, production passwords, or real signatures in this project.

---

## Database Schema Explanation

```mermaid
erDiagram
    USER ||--o{ VOUCHER : "submits"
    USER ||--o{ VOUCHER : "approves or rejects"
    VOUCHER ||--o{ VOUCHER_EVENT : "records"

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role
        string employeeId
        string department
    }

    VOUCHER {
        string id PK
        string voucherNumber UK
        string employeeId FK
        decimal amount
        enum status
        string employeeSignatureKey
        string directorSignatureKey
        string approvedBy FK
        datetime approvedAt
        string rejectionReason
    }

    VOUCHER_EVENT {
        string id PK
        string voucherId FK
        string actorId FK
        string action
        string previousStatus
        string newStatus
        string note
        datetime createdAt
    }
```

### `User`

Stores identity, role, password hash, optional employee ID, and department.

### `Voucher`

Stores one expense request with a unique generated voucher number, exact monetary amount, workflow status, signatures, approval metadata, and rejection reason.

### `VoucherEvent`

Provides an immutable-style timeline of meaningful workflow activity:

```text
CREATED
UPDATED
SIGNATURE_UPLOADED
SUBMITTED
APPROVED
REJECTED
```

### Data Integrity Rules

The database protects important business rules even if a browser request is manipulated:

- Voucher amount must be greater than zero.
- Voucher number must be unique.
- Every non-draft voucher requires an employee signature.
- Every approved voucher requires a Director signature and approval timestamp.
- Every rejected voucher requires a non-empty rejection reason.
- Voucher data links to valid Employee and Director records.
- Indexed fields support efficient filtering and dashboards.

Migration files are committed in:

```text
server/prisma/migrations/
```

The Prisma schema is located at:

```text
server/prisma/schema.prisma
```

---

## API Documentation

The API base path is:

```text
/api
```

| Module | Endpoint | Description |
|---|---|---|
| Health | `GET /api/health` | API health check |
| Auth | `POST /api/auth/login` | Authenticates a seeded user |
| Auth | `POST /api/auth/logout` | Clears session cookie |
| Auth | `GET /api/auth/me` | Restores authenticated session |
| Dashboard | `GET /api/dashboard` | Returns role-specific metrics |
| Vouchers | `POST /api/vouchers` | Employee creates a draft |
| Vouchers | `GET /api/vouchers` | Role-safe voucher list |
| Vouchers | `GET /api/vouchers/:id` | Role-safe voucher detail |
| Vouchers | `PATCH /api/vouchers/:id` | Employee updates own draft |
| Vouchers | `DELETE /api/vouchers/:id` | Employee deletes own draft |
| Workflow | `POST /api/vouchers/:id/submit` | Employee submits draft |
| Workflow | `POST /api/vouchers/:id/approve` | Director approves with signature |
| Workflow | `POST /api/vouchers/:id/reject` | Director rejects with reason |
| Signatures | `POST /api/vouchers/:id/employee-signature` | Employee uploads draft signature |
| Signatures | `GET /api/vouchers/:id/signatures/:type` | Authorized signature retrieval |

### Voucher Search and Filter Query Parameters

```text
page
pageSize
search
department
expenseCategory
status
dateFrom
dateTo
minAmount
maxAmount
sortBy
sortOrder
```

The server enforces Employee ownership regardless of query parameters sent by the browser.

For detailed request bodies, response formats, error codes, and route rules, see [docs/API.md](docs/API.md).

---

## Security Decisions

<details>
<summary><strong>Authentication and session security</strong></summary>

- Passwords are hashed with bcrypt.
- JWTs are stored in HTTP-only cookies.
- JWTs are never placed in localStorage or sessionStorage.
- Login responses exclude password hashes.
- CORS allows only `http://localhost:5173` during development.
- Protected API routes verify the JWT and role on every request.

</details>

<details>
<summary><strong>Voucher authorization</strong></summary>

- Employees can access only their own voucher records.
- Employees cannot edit or delete after submission.
- Directors cannot modify employee-entered expense details.
- Accounts users are read-only.
- Status and ownership fields are controlled only by the backend.

</details>

<details>
<summary><strong>Signature upload security</strong></summary>

- Files are stored outside the frontend public directory.
- Only PNG and JPEG files are accepted.
- Files are limited to 2 MB.
- Magic-byte file validation prevents trusting browser MIME types alone.
- Server-generated UUID file names prevent filename attacks.
- Signature access requires voucher authorization.
- Replaced draft signatures and deleted-draft signatures are removed safely.

</details>

---

## Validation and Quality Commands

### Backend

```powershell
cd server
npm run test
npm run typecheck
npm run db:status
npm run prisma:generate
```

### Frontend

```powershell
cd client
npm run lint
npm run build
```

---

## Assumptions Made During Development

1. “Submitted” is an audit event; the persisted post-submission status is `PENDING_APPROVAL`.
2. Each voucher represents one expense total, category, and description—no receipt or line-item module is included.
3. There is no public registration flow; test users are seeded locally because the assignment defines fixed roles.
4. The Director reviews vouchers across the organization, not only within a department.
5. Accounts users can view all vouchers but cannot change any data.
6. Employee and Director signatures belong to a specific voucher and are stored as private local files.
7. The project intentionally runs locally and is not deployed.
8. INR formatting is used in the UI for expense values.

---

## Repository Structure

```text
expense-voucher-manasys/
├── client/                     # React + Vite frontend
│   └── src/
├── server/                     # Express + Prisma backend
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── scripts/                # Integration test scripts
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   └── lib/
│   └── uploads/signatures/     # Ignored private local files
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── ASSUMPTIONS.md
│   ├── STITCH-UI-MAP.md
│   └── TEST-PLAN.md
├── .gitignore
└── README.md
```

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Assumptions](docs/ASSUMPTIONS.md)
- [Test Plan](docs/TEST-PLAN.md)
- [Stitch UI Route Map](docs/STITCH-UI-MAP.md)
- [Database Schema](server/prisma/schema.prisma)
- [Database Migrations](server/prisma/migrations/)
- [Environment Template](server/.env.example)

---

## Demo Flow

```text
Employee logs in
→ creates a draft
→ adds employee signature
→ submits for approval
→ Director approves or rejects
→ Accounts reviews the final voucher
```

---

## Submission Checklist

- [x] React responsive frontend
- [x] Node.js and Express REST API
- [x] JWT authentication and role authorization
- [x] PostgreSQL database and Prisma migrations
- [x] Secure signature uploads
- [x] Dashboard metrics for all roles
- [x] Search, filters, sorting, and pagination
- [x] Database constraints and audit trail
- [x] `.env.example`
- [x] Setup documentation
- [x] API documentation
- [x] Database schema explanation
- [x] Assumptions documentation
- [x] Screenshots or short localhost demo video

---

Built as a Full Stack Developer Internship Assignment.
