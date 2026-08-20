# Department Asset Tracking System — Week 1 Prototype (HTML/CSS/JS + MySQL)

Stack: plain HTML + CSS + JavaScript (frontend) · Node.js + Express (backend) ·
MySQL (database) · Tesseract.js + Sharp (OCR)

## 1. Prerequisites

- Node.js 18+ and npm
- MySQL Server running locally

## 2. Database Setup

Run the SQL files in this exact order:

```bash
cd backend/database
mysql -u root -p < schema.sql            # your original schema (roles, departments, users, locations, assets, asset_tags)
mysql -u root -p < seed.sql               # your original seed data (roles, departments, locations)
mysql -u root -p < disposal_requests.sql  # adds the disposal_requests table (needed for Module 9)
mysql -u root -p < seed_assets.sql        # sample assets + tags for the demo (CE-LAB3-042, etc.)
```

## 3. Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env with your MySQL username/password
npm install
npm run dev
```

You should see: `Server running at http://localhost:8000`

The backend also serves the frontend automatically — no separate frontend server needed.

## 4. Open the App

Visit **http://localhost:8000** in your browser.

- **Register Asset** — fill in the form and submit to store a new asset in MySQL.
- **Identify Asset** — search by typing an Asset Code, or upload a photo of an
  asset code/barcode label to run OCR automatically.
- On the result card, use **Request Disposal** to submit a disposal request
  (stored with status `pending` in `disposal_requests`).

## Folder Structure

```
backend/
  database/
    schema.sql              # your original schema
    seed.sql                 # your original seed data
    disposal_requests.sql    # added: disposal request/approval table
    seed_assets.sql          # added: sample assets + tags for demo
  src/
    index.js                 # Express app entry point (also serves frontend/)
    db/pool.js                # MySQL connection pool (mysql2)
    routes/assets.js          # register, get, search, OCR lookup
    routes/disposal.js        # disposal requests
    routes/lookups.js         # departments/locations for dropdowns
    services/ocrService.js    # Sharp preprocessing + Tesseract.js

frontend/
  index.html, register.html, identify.html
  css/style.css
  js/api.js        # fetch calls to the backend
  js/register.js    # registration page logic
  js/identify.js     # identification + disposal page logic
```

## Note on the schema

Your `schema.sql` tracks asset status directly (`available`, `assigned`, `maintenance`,
`damaged`, `lost`, `disposed`) but has no table for a disposal **request/approval**
workflow. Since Module 9 needs a request that starts as `pending`, `disposal_requests.sql`
adds one small table (`disposal_requests`) referencing `assets(asset_id)`. Nothing in
your original `schema.sql` or `seed.sql` was changed.
