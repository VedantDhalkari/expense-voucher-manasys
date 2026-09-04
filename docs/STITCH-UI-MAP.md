# Stitch UI to Routes & API Map

This document maps the screens found in the Stitch design system to the planned React routes and required API endpoints.

## 1. Authentication & Common
| Stitch Screen | React Route | API Endpoints | Description |
| --- | --- | --- | --- |
| Login - ExpenseFlow Portal | `/login` | `POST /api/auth/login` | User login. Issues HTTP-only JWT. |
| Voucher Details (Read-Only) | `/vouchers/:id` | `GET /api/vouchers/:id` | Universal read-only view for a voucher and its timeline. |

## 2. Employee Role
| Stitch Screen | React Route | API Endpoints | Description |
| --- | --- | --- | --- |
| Employee Dashboard | `/employee` | `GET /api/vouchers/stats` | High-level metrics for the employee. |
| My Vouchers - ExpenseFlow | `/employee/vouchers` | `GET /api/vouchers` | List of employee's own vouchers. |
| Create Voucher - ExpenseFlow | `/employee/vouchers/new` | `POST /api/vouchers` | Create a new DRAFT voucher. |
| Edit Draft Voucher | `/employee/vouchers/:id/edit` | `PUT /api/vouchers/:id` | Edit a DRAFT voucher. |
| Voucher Details - ExpenseFlow | `/employee/vouchers/:id` | `GET /api/vouchers/:id`<br>`POST /api/vouchers/:id/submit` | View own voucher. Can submit (DRAFT → PENDING_APPROVAL). |

## 3. Director Role
| Stitch Screen | React Route | API Endpoints | Description |
| --- | --- | --- | --- |
| Director Dashboard | `/director` | `GET /api/vouchers/stats` | Overview of pending approvals and team metrics. |
| Pending Approvals | `/director/approvals` | `GET /api/vouchers?status=PENDING_APPROVAL` | List vouchers awaiting the director's review. |
| Director Voucher Review | `/director/approvals/:id` | `GET /api/vouchers/:id`<br>`POST /api/vouchers/:id/approve`<br>`POST /api/vouchers/:id/reject` | Review a voucher. Add remarks and approve/reject. |

## 4. Accounts Role
| Stitch Screen | React Route | API Endpoints | Description |
| --- | --- | --- | --- |
| Accounts Dashboard | `/accounts` | `GET /api/vouchers/stats` | Financial overview, total approved/paid. |
| All Vouchers Registry | `/accounts/vouchers` | `GET /api/vouchers` | Registry of all vouchers across the company. |

## Design System Summary
- **Colors**: Primary Navy (`#0F172A`), Secondary Slate Blue (`#1E293B`), Accent Blue (`#2563EB`).
- **Typography**: Plus Jakarta Sans for headers, Inter for data/body. Tabular numerics enabled.
- **Layout**: 264px primary left nav, 64px top bar. 
- **Workflow State Colors**: 
  - Approved: Emerald green
  - Pending: Amber
  - Rejected: Crimson red
  - Draft: Slate/Gray
