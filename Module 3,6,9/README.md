# Department Asset Tracking and Barcode Reader — Week 2 Prototype

Modules 3, 6, and 9 | Team ID 03 | Mentor: Mr. Mahesh Kandekar

Stack: HTML/CSS/JS frontend (shared design system) · Node.js + Express backend
· MySQL database · Tesseract.js + Sharp (OCR)

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

On Windows PowerShell, wrap each in `cmd /c "..."`, e.g.:
```powershell
cmd /c "mysql -u root -p < schema.sql"
```

## Backend Setup

```bash
cd backend
cp .env.example .env      # edit with your MySQL username/password
npm install
npm run dev
```

Runs at **http://localhost:8000** and also serves the frontend — no
separate frontend server needed.

## Using the App

- **Dashboard** (`/`) — entry point with cards for each module.
- **Register** — department, location, category, make, model, and serial
  number are required. Purchase date is optional.
- **Identify** — manual code search, or photo upload for OCR.
- On an asset's result card, click **Request Disposal** to raise a request
  (Requested By, Reason, and Method are required; Remarks is optional).
- **Disposal Requests** page — review all requests, **Approve** a pending
  one (you'll be asked for your name), then **Mark Disposed** once approved.

## What's implemented vs. planned

**Done:**
- Registration, manual search, and OCR-based identification, all tested
  against a live database.
- Full disposal lifecycle: request → approval → disposal, with the asset's
  own status updating automatically at the final step.
- Shared design system (colors, typography, spacing, component patterns)
  applied consistently across every page.
- Database-level fixes for missing/NULL columns flagged by the mentor.

**Not yet implemented:**
- Authentication and role-based access control (anyone can currently
  approve a disposal request; there's no login).
- Restricting approval to authorized roles only.
- Reports and audit logs.
- Production deployment.

## Folder Structure

```
backend/
  database/    schema.sql, seed.sql, disposal_requests.sql, seed_assets.sql,
               week2_schema_updates.sql, fix_empty_columns.sql,
               revert_purchase_date.sql
  src/
    index.js            Express entry point (also serves frontend/)
    db/pool.js            MySQL connection pool
    routes/
      assets.js            register, search, OCR lookup
      disposal.js           create, list, approve, dispose
      lookups.js             departments/locations for dropdowns
    services/ocrService.js  Sharp preprocessing + Tesseract.js

frontend/
  css/variables.css   shared design tokens
  css/style.css         built from those tokens
  index.html              dashboard
  register.html, identify.html, disposal.html
  js/api.js, register.js, identify.js, disposal.js
```
