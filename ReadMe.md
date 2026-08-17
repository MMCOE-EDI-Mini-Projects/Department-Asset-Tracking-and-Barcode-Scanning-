# Department Asset Tracking and Barcode Reader

A web or mobile-based system that manages departmental assets using barcode labels and scanner input. The system combines a barcode label, scanning hardware or mobile app, and tracking software that updates asset records in real time.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Objectives](#project-objectives)
- [Stakeholders](#stakeholders)
- [High-Level Modules](#high-level-modules)
- [Functional Requirements by Module](#functional-requirements-by-module)
- [Suggested Workflow](#suggested-workflow)
- [Architecture](#architecture)
- [Suggested Database Entities](#suggested-database-entities)
- [Tech Stack](#tech-stack)
- [Team Distribution](#team-distribution)
- [Roadmap](#roadmap)

---

## Project Overview

Department Asset Tracking and Barcode Reader is a web or mobile-based system that manages departmental assets using barcode labels and scanner input. Barcode asset tracking systems typically rely on three core elements: a barcode label, scanning hardware or mobile app, and tracking software that updates asset records in real time.

## Project Objectives

The system is intended to improve asset visibility, reduce loss and manual errors, speed up audits, and maintain an accurate record of asset location, custodian, and status. Best-practice guidance for barcode tracking emphasizes clean master data, standardized IDs, defined scan workflows, and exception handling for missing or unmatched assets.

## Stakeholders

The main stakeholders are department admins, asset managers, custodians, auditors, staff users, and IT support. Barcode-based asset systems usually require controlled user roles so scans can prove receipt, transfer, verification, maintenance, or retirement depending on the workflow.

## High-Level Modules

1. User and role management
2. Asset master and barcode tagging
3. Barcode label generation and printing
4. Asset receiving and registration
5. Asset assignment and transfer
6. Barcode scanning and verification
7. Maintenance and status tracking
8. Inventory reconciliation and audit
9. Disposal and write-off management
10. Reports, analytics, and audit logs

## Functional Requirements by Module

### 1. User and Role Management

Controls login, permissions, and account administration. Barcode asset systems need role-based access so only authorized users can create assets, scan items, approve transfers, and close audits.

- The system shall allow administrators to create, edit, activate, suspend, and delete user accounts.
- The system shall support roles such as asset admin, department head, scanner operator, auditor, and general staff.
- The system shall enforce role-based permissions for every asset transaction.
- The system shall provide secure login and logout.
- The system shall maintain an audit trail of user actions.
- The system shall allow profile updates such as name, department, designation, email, and phone number.

### 2. Asset Master and Barcode Tagging

Creates the official asset record and links it to a unique barcode identity. Barcode tracking guidance recommends a stable internal asset ID, standardized numbering, and a label placed on a clean, accessible surface.

- The system shall allow authorized users to create, edit, and delete asset master records.
- The system shall generate a unique asset code for each asset.
- The system shall support asset classification by department, category, location, custodian, and status.
- The system shall store asset details such as name, make, model, serial number, purchase date, cost, warranty expiry, and condition.
- The system shall link each asset to a barcode value or QR code value.
- The system shall support asset images and document attachments such as invoice, warranty, and handover forms.
- The system shall allow bulk import of asset master data.

### 3. Barcode Label Generation and Printing

Produces barcode labels for assets and supports tag issuance. Barcode asset systems depend on a durable label, a printing process, and a consistent placement rule across asset classes.

- The system shall generate printable barcode labels for one or multiple assets.
- The system shall support barcode symbologies approved by the organization, such as 1D barcode or QR code.
- The system shall allow label templates with asset code, asset name, department, and location.
- The system shall support reprinting of damaged or lost labels.
- The system shall track label issuance history.
- The system shall allow label status values such as printed, issued, applied, damaged, or replaced.
- The system shall support batch printing for new procurement lots.

### 4. Asset Receiving and Registration

Records assets when they are received into the department. Barcode asset-tracking workflows recommend that a new asset should not become active without a record, label, and assigned location or custodian.

- The system shall allow asset receipt entry for purchased, transferred, donated, or repaired assets.
- The system shall capture supplier, invoice number, receipt date, quantity, and cost.
- The system shall allow barcode scanning during receipt to reduce manual entry.
- The system shall generate a pending-to-active approval workflow if required.
- The system shall mark the asset as available only after successful registration.
- The system shall store receiving remarks and supporting documents.
- The system shall log who registered the asset and when.

### 5. Asset Assignment and Transfer

Assigns assets to users, rooms, or departments and records movement history. Barcode asset-tracking practice uses scan-based check-in/check-out to prove custody changes.

- The system shall allow asset assignment to a custodian, location, room, or department.
- The system shall allow inter-department and intra-department transfer.
- The system shall record transfer date, from-location, to-location, handover user, receiver user, and approval status.
- The system shall require barcode scanning during transfer confirmation.
- The system shall maintain complete transfer history for each asset.
- The system shall prevent transfer of disposed or blocked assets.
- The system shall support transfer approval for sensitive or high-value assets.

### 6. Barcode Scanning and Verification

Supports handheld scanning for cycle counts, audits, check-in/check-out, and finding asset mismatches.

- The system shall allow scan input from handheld barcode readers and mobile camera scanners.
- The system shall validate scanned barcode values against the asset database.
- The system shall display asset details immediately after a successful scan.
- The system shall support scan actions such as receive, issue, transfer, verify, locate, and return.
- The system shall record scan time, scan device, user, and GPS or zone data if enabled.
- The system shall identify unmatched, duplicate, unreadable, or unknown barcode scans.
- The system shall support offline scan capture with later synchronization if mobile deployment is used.

### 7. Maintenance and Status Tracking

Handles asset condition changes and service events. Asset management systems usually store status values such as available, assigned, under maintenance, lost, damaged, or retired.

- The system shall allow users to report damaged or faulty assets.
- The system shall create maintenance tickets linked to a specific asset.
- The system shall track maintenance status from open to closed.
- The system shall record service date, technician, cost, and remarks.
- The system shall allow barcode scanning to confirm the asset before maintenance processing.
- The system shall update asset status after maintenance action is completed.
- The system shall keep maintenance history for reporting and audit.

### 8. Inventory Reconciliation and Audit

Periodic stocktaking and reconciliation between physical assets and system records. Barcode tracking guidance strongly recommends verification cycles and exception handling for missing or unmatched assets.

- The system shall allow scheduled physical verification by department, location, or asset class.
- The system shall support scan-based stocktake using barcode reader input.
- The system shall mark assets as found, missing, misplaced, damaged, or not accessible.
- The system shall generate variance reports comparing system records and physical scan results.
- The system shall allow reconciliation comments and approval of discrepancies.
- The system shall maintain verification history by audit cycle.
- The system shall provide closure status for each completed audit.

### 9. Disposal and Write-off Management

Manages asset retirement, disposal, write-off, or sale. Barcode asset-tracking workflows recommend that retirement should record the reason, approval, effective date, and closure step.

- The system shall allow authorized users to create a disposal request for obsolete, damaged, lost, or sold assets.
- The system shall require approval before disposal is finalized.
- The system shall capture disposal reason, date, method, and approver details.
- The system shall update the asset status to disposed, written off, sold, or scrapped.
- The system shall preserve disposal history for audit and finance review.
- The system shall prevent disposed assets from being reassigned or scanned as active.
- The system shall generate disposal reports by period and category.

### 10. Reports, Analytics, and Audit Logs

Provides management visibility and compliance support. Barcode asset management systems commonly track asset movement history, inventory counts, and system logs for accountability.

- The system shall generate asset summaries by department, category, location, custodian, and status.
- The system shall generate transfer history, maintenance history, and disposal history reports.
- The system shall generate barcode scan activity reports.
- The system shall provide inventory variance and audit completion reports.
- The system shall export reports to PDF and spreadsheet formats.
- The system shall show dashboards for total assets, active assets, missing assets, maintenance items, and disposed assets.
- The system shall keep complete audit logs of create, update, delete, transfer, scan, and approval actions.

## Suggested Workflow

1. Admin creates users, roles, and locations.
2. Asset manager registers an asset after purchase or receipt.
3. System generates a barcode label and prints it.
4. Barcode is applied to the asset and scanned into the system.
5. Asset is assigned to a user, room, or department.
6. During transfers or audits, the barcode is scanned to confirm movement or physical presence.
7. Maintenance, disposal, or write-off actions are processed through approval.
8. Reports and logs are reviewed by management and auditors.

## Architecture

A practical architecture for this project is a three-layer web application:

- **Presentation layer** — for staff and auditors
- **Application layer** — for asset registration, barcode generation, scanning, transfer, inventory verification, and reporting
- **Data layer** — for users, assets, scans, and logs

This structure is consistent with barcode tracking systems that combine labels, readers, and software into one controlled workflow.

```
Presentation Layer
      │
      ▼
Application Layer
 (registration, barcode generation,
  scanning, transfer, verification,
  reporting)
      │
      ▼
   Data Layer
 (users, assets, scans, logs)
```

## Suggested Database Entities

| Entity | Main Purpose |
|---|---|
| Users | Stores login and profile details |
| Roles | Stores user permissions |
| Departments | Stores department master data |
| Locations | Stores room, floor, or site data |
| Assets | Stores core asset information |
| AssetTags | Stores barcode or QR values |
| LabelPrintJobs | Stores label printing history |
| AssetAssignments | Stores custody records |
| AssetTransfers | Stores movement history |
| ScanLogs | Stores barcode scan events |
| MaintenanceTickets | Stores repair records |
| PhysicalVerifications | Stores audit or stocktake data |
| DisposalRecords | Stores retirement and write-off details |
| AuditLogs | Stores system activity history |

## Tech Stack

**Frontend (Web):** React or Vue, with a barcode-scanning library (`html5-qrcode` or `zxing-js`) for camera-based scans.

**Mobile:** React Native or Flutter — needed for offline scan capture in low-connectivity areas.

**Backend/API:** Node.js (Express/NestJS) or Django REST Framework.

**Database:** PostgreSQL.

**Barcode/Label Generation:** `bwip-js` or `python-barcode`/`qrcode`, with a PDF templating layer for label sheets.

**Auth:** JWT-based sessions with role middleware (asset admin, dept head, scanner operator, auditor, staff).

**Reporting/Export:** Puppeteer or ReportLab (PDF) + SheetJS (spreadsheet export).

**Hosting:** Docker Compose for a student/department-scale deployment.

## Team Distribution

| Team | Members | Modules |
|---|---|---|
| **Team 1** | Yash Bhure, Tanishka Wagh, Uday Pawade, Sanskruti Ghavghave | User and Role Management; Asset Master and Barcode Tagging; Reports, Analytics, and Audit Logs |
| **Team 2** | Vedant Pathak, Arya Joshi, Pranjal Khairnar | Barcode Label Generation and Printing; Barcode Scanning and Verification; Disposal and Write-off Management |
| **Team 3** | Shreya Rathod, Swayamprabha Badade, Siddiqa Bagwan | Asset Receiving and Registration; Asset Assignment and Transfer |
| **Team 4** | Viraj Joglekar, Sai Patil, Mayur Kolhe | Maintenance and Status Tracking; Inventory Reconciliation and Audit |

> Note: **Disposal and Write-off Management** is currently listed under both Team 3 and Team 4 — worth confirming which team actually owns it (or whether it's intentionally split, e.g. Team 3 handles the request/approval flow and Team 4 handles the reconciliation-driven write-offs) so there's no duplicated or conflicting work.

## Roadmap

| Phase | Focus |
|---|---|
| Weeks 1–2 | Foundation — Team 1 builds core schemas and RBAC; other teams design against stubs |
| Weeks 3–4 | Core workflows in parallel — labeling/receiving/transfer (Team 2), scan input (Team 3), dashboard skeleton (Team 4) |
| Weeks 5–6 | Lifecycle depth — maintenance & disposal (Team 3), transfer approvals (Team 2), audit trail hardening (Team 1) |
| Weeks 6–7 | Integration — reconciliation/audit wired to real data; cross-module dependencies connected |
| Week 8 | Offline sync & edge cases — offline scan capture and unmatched/duplicate scan handling (if mobile in scope) |
| Weeks 9–10 | Testing, QA, and demo prep — end-to-end workflow testing, report export, final polish |
