# API Specification

All endpoints are prefixed with `/api`. Authentication relies on an HTTP-only cookie containing the JWT.

## Authentication
- `POST /auth/login`
  - Body: `{ email, password }`
  - Action: Verifies credentials, sets HTTP-only `token` cookie.
- `POST /auth/logout`
  - Action: Clears the `token` cookie.
- `GET /auth/me`
  - Action: Returns the currently authenticated user's profile and role.

## Vouchers
- `GET /vouchers`
  - Query: `?status=DRAFT,PENDING_APPROVAL`
  - Action: Returns vouchers based on the user's role and query filters.
- `GET /vouchers/:id`
  - Action: Returns full voucher details, line items, and the audit timeline.
- `POST /vouchers`
  - Body: `{ title, amount, items: [...] }`
  - Action: Creates a new voucher in `DRAFT` status. (Employee only)
- `PUT /vouchers/:id`
  - Body: `{ title, amount, items: [...] }`
  - Action: Updates a `DRAFT` voucher. (Employee only)
- `DELETE /vouchers/:id`
  - Action: Deletes a `DRAFT` voucher. (Employee only)
- `POST /vouchers/:id/submit`
  - Action: Transitions from `DRAFT` to `PENDING_APPROVAL`. Adds "Submitted" to the audit timeline.
- `POST /vouchers/:id/approve`
  - Body: `{ remarks }` (Optional)
  - Action: Transitions from `PENDING_APPROVAL` to `APPROVED`. Adds to timeline. (Director only)
- `POST /vouchers/:id/reject`
  - Body: `{ remarks }` (Required)
  - Action: Transitions from `PENDING_APPROVAL` to `REJECTED`. Adds to timeline. (Director only)

## Analytics & Dashboard
- `GET /vouchers/stats`
  - Action: Returns aggregated counts and sums (e.g., total pending amount, total approved) depending on the caller's role.

## File Uploads
- `POST /upload/signature`
  - Action: Accepts multipart/form-data for image files. 
  - Storage: Saves locally to `server/uploads/signatures/`.
  - Returns: Local URL/path reference to the signature.
