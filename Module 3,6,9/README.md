# Department Asset Tracking and Barcode Reader — Week 3 Prototype

Modules 3, 6, and 9 | Team ID 03 | Mentor: Mr. Mahesh Kandekar

Stack: HTML/CSS/JS frontend (shared design system) · Node.js + Express backend
· MySQL database · Tesseract.js + Sharp (OCR) · JWT authentication (bcrypt + jsonwebtoken)

## What this prototype does

- **Module 3 — Asset Registration.** Register a new asset with its code,
  name, category, department, location, make, model, serial number, and
  condition. Saved to MySQL, with a matching barcode/tag entry created
  automatically.
- **Module 6 — Asset Identification.** Find an asset by typing its code
  manually, or by uploading a photo of the code label — OCR extracts the
  code and looks it up automatically.
- **Module 9 — Disposal and Write-off.** Raise a disposal request from an
  asset's details page, then track it through the full lifecycle: request
  (pending) → approval (approved) → finalized (disposed), at which point
  the asset itself is marked disposed and excluded from active use.

## Week 3 additions

- **Authentication.** Login page (`login.html`) with JWT-based sessions.
  Token is stored in `localStorage` and sent as `Authorization: Bearer <token>`
  on protected API calls. Sessions expire after 8 hours.
- **Role-based access control.** Three roles with fine-grained permissions
  embedded in the JWT:
  - `asset_admin` — full access (`"all": true`)
  - `dept_head` — can approve disposal requests (`"approve_disposal": true`)
  - `staff` — view/register only
- **Auth middleware.** `requireAuth` and `requirePermission(key)` middleware
  guards all sensitive routes. Disposal approval now requires `approve_disposal`.
- **Reports page.** `reports.html` shows total asset count plus breakdowns
  by status, category, department, and disposal request status — available
  to any logged-in user.
- **User seeding script.** `npm run seed:users` hashes passwords with bcrypt
  and inserts three test accounts (see below).

## Database Setup

Run these in order (skip any you've already applied):

```bash
cd backend/database
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
mysql -u root -p < disposal_requests.sql
mysql -u root -p < seed_assets.sql
mysql -u root -p < week2_schema_updates.sql
mysql -u root -p < fix_empty_columns.sql
mysql -u root -p < revert_purchase_date.sql
```

`week3_notes.sql` contains no schema changes — the `users` table already
existed. Skip it, or run it as a no-op for documentation purposes.

On Windows PowerShell, wrap each in `cmd /c "..."`, e.g.:
```powershell
cmd /c "mysql -u root -p < schema.sql"
```

## Backend Setup

```bash
cd backend
cp .env.example .env      # edit with your MySQL credentials and JWT_SECRET
npm install
npm run seed:users        # creates 3 test accounts with bcrypt-hashed passwords
npm run dev
```

Runs at **http://localhost:8000** and also serves the frontend — no
separate frontend server needed.

## Test Accounts

| Email | Password | Role |
|---|---|---|
| admin@mmcoe.edu | Admin@123 | asset_admin (full access) |
| depthead@mmcoe.edu | DeptHead@123 | dept_head (can approve disposals) |
| staff@mmcoe.edu | Staff@123 | staff (view/register only) |

## Using the App

- **Login** (`login.html`) — required before accessing protected features.
  The nav bar shows your name and role once logged in.
- **Dashboard** (`/`) — entry point with cards for each module.
- **Register** — department, location, category, make, model, and serial
  number are required. Purchase date is optional.
- **Identify** — manual code search, or photo upload for OCR.
- On an asset's result card, click **Request Disposal** to raise a request
  (Requested By, Reason, and Method are required; Remarks is optional).
- **Disposal Requests** page — review all requests. Only `dept_head` and
  `asset_admin` roles can **Approve** a pending request and **Mark Disposed**.
- **Reports** — asset and disposal counts, visible to any logged-in user.

## What's implemented vs. planned

**Done:**
- Registration, manual search, and OCR-based identification, all tested
  against a live database.
- Full disposal lifecycle: request → approval → disposal, with the asset's
  own status updating automatically at the final step.
- JWT authentication with bcrypt password hashing and role-based permissions.
- Disposal approval restricted to authorized roles only.
- Reports page with summary statistics.
- Shared design system applied consistently across every page.

**Not yet implemented:**
- Production deployment.
- Audit logs / change history.

## Folder Structure

```
backend/
  database/    schema.sql, seed.sql, disposal_requests.sql, seed_assets.sql,
               week2_schema_updates.sql, fix_empty_columns.sql,
               revert_purchase_date.sql, week3_notes.sql
  src/
    index.js              Express entry point (also serves frontend/)
    db/pool.js            MySQL connection pool
    middleware/auth.js    requireAuth + requirePermission JWT middleware
    routes/
      auth.js             POST /auth/login — issues JWT
      assets.js           register, search, OCR lookup
      disposal.js         create, list, approve, dispose (guarded by permission)
      lookups.js          departments/locations for dropdowns
      reports.js          GET /reports/summary (requireAuth)
    scripts/
      seed_users.js       bcrypt-hashes passwords and inserts test users
    services/ocrService.js  Sharp preprocessing + Tesseract.js

frontend/
  css/variables.css     shared design tokens
  css/style.css         built from those tokens
  nav.js                shared nav bar (shows login/logout based on token)
  index.html            dashboard
  login.html            JWT login form
  register.html
  identify.html
  disposal.html
  reports.html
  js/api.js             fetch wrapper with auth header injection
```
