# Test Plan

## 1. Authentication Security Verification
- **HTTP-Only Cookies**: Log in via the `/api/auth/login` endpoint. Attempt to read `document.cookie` in the browser console. Verify that the JWT token is **not** accessible via JavaScript.
- **Role Isolation**: 
  - Log in as `EMPLOYEE`. Attempt to access `POST /api/vouchers/:id/approve`. Ensure a `403 Forbidden` is returned.
  - Log in as `EMPLOYEE`. Attempt to fetch all vouchers via `/api/vouchers`. Ensure only their own vouchers are returned.

## 2. Voucher Workflow E2E Test
- **Step 1 (Draft)**: Employee creates a voucher. Verify status is `DRAFT`.
- **Step 2 (Submit)**: Employee submits the voucher. 
  - Verify status changes to `PENDING_APPROVAL`.
  - Check the voucher timeline to ensure the "Submitted" event is logged accurately with a timestamp.
- **Step 3 (Review)**: Director views the voucher. 
  - Reject the voucher. Verify status changes to `REJECTED` and remarks are saved in the timeline.
  - Approve a different voucher. Verify status changes to `APPROVED` and timeline updates.
- **Step 4 (Registry)**: Accounts user logs in and verifies the presence of the `APPROVED` voucher in the All Vouchers Registry.

## 3. Signature Upload Testing
- Upload a standard PNG/JPG signature via `POST /api/upload/signature` (ensure size < 2MB).
- Verify the file is physically written to `server/uploads/signatures/` with a server-generated filename.
- Verify that attempting to fetch the signature via `GET /api/vouchers/:id/signatures/:type` works for authorized roles and returns a 401/403 for unauthorized users.

## 4. UI Precision & Styling
- Verify tabular figures (`font-feature-settings: "tnum" 1`) are active on all currency amounts.
- Verify color contrast and status badge colors map exactly to the specified design system values.
