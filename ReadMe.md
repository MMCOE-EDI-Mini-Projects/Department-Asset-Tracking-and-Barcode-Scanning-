# MMCOE Department Asset Tracking & Barcode Scanning System

**Institutional Asset Management, Barcode/QR Generation & Verification System**  


---

## 📁 Repository Directory Structure

```text
Department Asset Tracking/
│
├── backend/                       # Spring Boot 3.3.5 Backend (Java 21/25)
│   ├── src/main/java/             # Controllers, Services, Repositories, Entities
│   ├── src/main/resources/
│   │   ├── application.properties # Server port, MySQL connection, JPA settings
│   │   └── static/                # Live frontend web files served directly by Spring Boot
│   ├── pom.xml                    # Maven dependencies (ZXing, Spring Data JPA, etc.)
│   └── mvnw.cmd                   # Maven wrapper
│
├── frontend/                      # Standalone Frontend Mirror (HTML5, CSS3, ES6+ JS)
│   ├── css/                       # Theme, navbar, layout, components stylesheets
│   ├── js/                        # API client, auth, scanner, and view controllers
│   ├── index.html                 # Main Dashboard & navigation hub
│   ├── login.html                 # Authentication & 1-click role switcher
│   ├── register.html              # Asset registration & bulk invoice receiving
│   ├── assets.html                # Institutional asset directory & specs
│   ├── scanner.html               # Barcode / QR camera scanner & gun lookup
│   ├── transfer.html              # Inter-departmental transfer & room reassignment
│   ├── maintenance.html           # Maintenance & repair ticketing lifecycle
│   ├── audit.html                 # Physical inventory stocktaking audit
│   ├── disposal.html              # Disposal & write-off two-step governance
│   └── reports.html               # Valuation analytics & audit trail logs
│
├── database/                      # Clean Master Database Scripts
│   ├── unified_schema.sql         # Complete 18-table unified MySQL database schema
│   ├── seed_data.sql              # Master demonstration seed dataset
│   └── asset_tracking_erd.pdf     # Entity Relationship Diagram (ERD)
│
├── docs/                          # Project Documentation & Presentation Materials
│   ├── README.md                  # Catalog of documentation assets
│   ├── Department_Asset_Tracking_Presentation.pptx # Comprehensive presentation deck
│   ├── TEAM LEADER WEEK 2.pptx    # Milestone presentation deck
│   ├── Team 1 B Batch Team 1.pptx.pdf # Project presentation PDF
│   └── frontend-design-system.md  # Design tokens and UI style specifications
│
├── run_backend.bat                # 1-Click launcher for examiners and evaluators
├── ReadMe.md                      # Primary project readme and documentation
└── .gitignore                     # Git ignore rules for build artifacts
```

---

## 📌 Architectural Overview

This system replaces fragmented departmental spreadsheets with an integrated, enterprise-grade institutional asset tracking portal:

- **Backend Architecture**: **Java 21/25 + Spring Boot 3.3.5** RESTful API with Spring Data JPA and Hibernate.
- **Database Layer**: **MySQL 8.0+** (`asset_tracking_db`) with fully normalized relational schemas, foreign keys, sequence generators, and transactional audit logging.
- **Frontend Layer**: **Pure Vanilla HTML5, CSS3, and Modern JavaScript** (Zero Node.js/npm dependencies, ultra-lightweight, responsive, and instant loading).
- **Barcode & QR Engine**: Native **ZXing (Zebra Crossing)** embedded engine generating Code 128 barcodes and 2D QR tags dynamically as high-resolution PNG image streams (`/api/barcode/*`).
- **Authentication & RBAC**: Role-Based Access Control restricting sensitive operations (transfers, maintenance, stocktaking audits, disposals) to authorized personnel.

---

## 📦 System Modules & Capabilities

| Module | Name | Key Functionalities |
|---|---|---|
| **Module 2 & 3** | Asset Cataloging & Registration | Single & batch equipment intake with atomic `AST-YYYY-XXXXXX` sequence generation, serial uniqueness validation, make/model, and warranty logging. |
| **Module 4** | Barcode & Asset Identification | On-demand dynamic Code 128 & QR code generation, USB keyboard-wedge barcode gun support, WebRTC camera scanning, and instant lookup. |
| **Module 5** | Custody & Departmental Transfer | Transfer equipment between departments, labs, and staff members with physical barcode verification and handover logs. |
| **Module 6** | Disposal & Write-off Lifecycle | Multi-step decommission workflow: request raising -> HOD review and approval -> final write-off execution. |
| **Module 7** | Maintenance & Repair Ticketing | Problem logging, technician assignment, Open $\rightarrow$ In Progress $\rightarrow$ Closed lifecycle, repair cost tracking, and automatic condition updates. |
| **Module 8** | Physical Inventory Stocktaking Audit | Scheduled audit cycles, live barcode scanning verification (`Found`, `Missing`, `Damaged`, `Misplaced`), and discrepancy reconciliation. |
| **Module 9** | Reports, Analytics & Auditing | Departmental distribution metrics, condition health graphs, financial valuation, and immutable forensic audit trail. |

---

## 🚀 Quick Start Guide

### 1. Database Setup
Make sure MySQL 8.0 is running on `localhost:3306`, then execute the unified schema and seed scripts:

```bash
# Initialize database schema and demo records
mysql -u root -p asset_tracking_db < database/unified_schema.sql
mysql -u root -p asset_tracking_db < database/seed_data.sql
```

*(Default connection configured in `backend/src/main/resources/application.properties`: user `root`, password `vedant`)*

---

### 2. Launch the Application

Double-click **`run_backend.bat`** in the project root, or execute:

```bash
cd backend
mvnw.cmd spring-boot:run
```

The Spring Boot server will initialize on **`http://localhost:8080`** and serve the complete web application.

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Asset Administrator** | `admin@mmcoe.edu` | `Admin@123` | Full administrative control across all 9 modules |
| **Department Head** | `depthead@mmcoe.edu` | `DeptHead@123` | Can approve disposal requests, initiate transfers, and manage audits |
| **Staff Member** | `staff@mmcoe.edu` | `Staff@123` | Asset directory search, barcode scanning, and intake |

*(Each demo role can also be populated with a single click on the login screen).*

---

## 🌐 Web Application URLs

- **Dashboard**: `http://localhost:8080/index.html`
- **Sign In**: `http://localhost:8080/login.html`
- **Receive & Register**: `http://localhost:8080/register.html`
- **Asset Directory**: `http://localhost:8080/assets.html`
- **Barcode & QR Scanner**: `http://localhost:8080/scanner.html`
- **Assign & Transfer**: `http://localhost:8080/transfer.html`
- **Maintenance & Repair**: `http://localhost:8080/maintenance.html`
- **Inventory Audit**: `http://localhost:8080/audit.html`
- **Disposal & Write-Off**: `http://localhost:8080/disposal.html`
- **Reports & Audit Trail**: `http://localhost:8080/reports.html`

---

## 📡 REST API Reference

- `POST /api/auth/login` — Authenticate and receive session token
- `GET /api/meta` — Lookup metadata (categories, departments, locations, suppliers, conditions)
- `GET /api/assets` — Filterable and searchable asset catalog
- `GET /api/assets/{id}` / `GET /api/assets/code/{code}` — Specific asset specifications
- `GET /api/assets/check-serial?serial={sn}` — Real-time serial number uniqueness validation
- `POST /api/assets/register` — Single asset registration
- `POST /api/receipts/batch-register` — Batch intake with invoice and multi-unit code generation
- `GET /api/barcode/generate?code={code}` — Dynamic Code 128 PNG barcode stream
- `GET /api/barcode/qr?text={text}` — Dynamic QR Code PNG stream
- `POST /api/transfers` — Execute departmental transfer / lab reassignment
- `GET /api/maintenance/tickets` / `POST /api/maintenance/tickets` — Manage repair tickets
- `GET /api/audit/cycles` / `POST /api/audit/items/verify` — Manage physical inventory audits
- `GET /api/disposal/requests` / `POST /api/disposal/{id}/approve` — Decommission workflow
- `GET /api/reports/summary` / `GET /api/reports/audit-logs` — Analytics and forensic audit logs
