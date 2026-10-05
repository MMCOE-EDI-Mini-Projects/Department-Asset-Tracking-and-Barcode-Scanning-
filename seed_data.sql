-- =====================================================================
-- Department Asset Tracking and Barcode Scanning System
-- Unified Seed Data (Consolidating Modules 2, 3, 4, 5, 6, 7, 8, 9)
-- Database: MySQL 8.0+
-- =====================================================================

USE asset_tracking_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. SEED ROLES
INSERT INTO roles (role_id, role_name, permissions) VALUES
(1, 'asset_admin', '{"all": true}'),
(2, 'dept_head', '{"approve_disposal": true, "approve_transfer": true, "approve_receiving": true}'),
(3, 'scanner_operator', '{"scan": true, "verify": true}'),
(4, 'auditor', '{"audit": true, "verify": true, "view_reports": true}'),
(5, 'staff', '{"scan": true, "view": true, "request_disposal": true, "register": true}')
ON DUPLICATE KEY UPDATE permissions = VALUES(permissions);

-- 2. SEED DEPARTMENTS
INSERT INTO departments (department_id, dept_code, name, is_active) VALUES
(1, 'CE', 'Computer Engineering', 1),
(2, 'ME', 'Mechanical Engineering', 1),
(3, 'IT', 'Information Technology', 1),
(4, 'ENTC', 'Electronics & Telecommunication', 1),
(5, 'EE', 'Electrical Engineering', 1),
(6, 'GEN', 'General Administration', 1)
ON DUPLICATE KEY UPDATE dept_code = VALUES(dept_code), name = VALUES(name);

-- 3. SEED LOCATIONS
INSERT INTO locations (location_id, location_code, name, department_id, type, is_active) VALUES
(1, 'MB-505', 'MB 505 - Advanced Computing Lab', 1, 'lab', 1),
(2, 'MB-508-1', 'MB 508 - Lab I (Software Systems)', 1, 'lab', 1),
(3, 'MB-508-2', 'MB 508 - Lab II (Networking)', 1, 'lab', 1),
(4, 'MB-501', 'MB 501 - HOD Cabin', 1, 'office', 1),
(5, 'MB-502', 'MB 502 - Faculty Room', 1, 'office', 1),
(6, 'MB-504', 'MB 504 - Seminar Hall', 1, 'hall', 1),
(7, 'ME-101', 'ME 101 - CAD/CAM Lab', 2, 'lab', 1),
(8, 'IT-301', 'IT 301 - Cloud Computing Lab', 3, 'lab', 1),
(9, 'SRV-01', 'Server Room - Main Block', 1, 'server_room', 1),
(10, 'STR-01', 'Central Asset Store Room', 6, 'storage', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), location_code = VALUES(location_code);

-- 4. SEED CATEGORIES
INSERT INTO categories (category_id, category_code, category_name, useful_life_years, depreciation_rate, requires_serial) VALUES
(1, 'LAP', 'Laptop', 4, 25.00, 1),
(2, 'DESK', 'Desktop Computer', 5, 20.00, 1),
(3, 'MON', 'Monitor & Display', 6, 15.00, 1),
(4, 'SVR', 'Server & Rack Unit', 7, 15.00, 1),
(5, 'PRN', 'Printer & Scanner', 5, 20.00, 1),
(6, 'NET', 'Network Switch / Router', 5, 20.00, 1),
(7, 'PROJ', 'Projector & AV Unit', 5, 20.00, 1),
(8, 'FURN', 'Furniture & Fixture', 10, 10.00, 0)
ON DUPLICATE KEY UPDATE category_code = VALUES(category_code), category_name = VALUES(category_name);

-- 5. SEED SUPPLIERS
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, email, phone, address) VALUES
(1, 'Dell Technologies India', 'Rajesh Sharma', 'sales@dell-india.com', '+91 98220 11223', 'Pune Tech Park, Pune'),
(2, 'HP Enterprise Solutions', 'Anil Verma', 'corporate@hpe-supplies.com', '+91 98221 44556', 'Kalyani Nagar, Pune'),
(3, 'Lenovo India Pvt Ltd', 'Priya Kulkarni', 'lenovo_gov@lenovo.in', '+91 98222 77889', 'Hinjewadi Phase 1, Pune'),
(4, 'Cisco Systems India', 'Vikram Sen', 'cisco-sales@cisco.com', '+91 98223 99001', 'Viman Nagar, Pune'),
(5, 'Godrej Interio Enterprise', 'Suresh Joshi', 'enterprise@godrej.com', '+91 98224 33221', 'Shivajinagar, Pune')
ON DUPLICATE KEY UPDATE supplier_name = VALUES(supplier_name);

-- 6. SEED ASSET CONDITIONS
INSERT INTO asset_conditions (condition_id, condition_name, blocks_usage, sort_order) VALUES
(1, 'New', 0, 1),
(2, 'Good', 0, 2),
(3, 'Fair', 0, 3),
(4, 'Damaged', 1, 4),
(5, 'Poor', 1, 5)
ON DUPLICATE KEY UPDATE condition_name = VALUES(condition_name), blocks_usage = VALUES(blocks_usage);

-- 7. SEED RECEIVING TYPES
INSERT INTO receiving_types (receiving_type_id, type_name, needs_invoice, sort_order) VALUES
(1, 'Purchased', 1, 1),
(2, 'Transferred', 0, 2),
(3, 'Donated / Grant', 0, 3),
(4, 'Returned from Maintenance', 0, 4)
ON DUPLICATE KEY UPDATE type_name = VALUES(type_name);

-- 8. SEED CODE SEQUENCES
INSERT INTO code_sequences (seq_key, current_value) VALUES
('ASSET', 1025),
('RECEIPT', 1010)
ON DUPLICATE KEY UPDATE current_value = VALUES(current_value);

-- 9. SEED DEFAULT USERS (Password hashes for Admin@123, DeptHead@123, Staff@123)
-- Standard BCrypt hash for "Admin@123": $2a$10$3sFpT4dM8zB056U4L.hV..j7XmI6zI4M0kQeR2u6aBq.YxS6cOa.y
INSERT INTO users (user_id, name, email, password_hash, role_id, department_id, designation, status, is_active) VALUES
(1, 'Vedant Pathak', 'admin@mmcoe.edu', '$2a$10$wT0vRz4E/W.f7Bln4g4u3.xN9jXoQjI9lXm0OqA/Osl0zBq0HqfG2', 1, 1, 'System Administrator & Team Lead', 'active', 1),
(2, 'Mahesh Kandekar', 'depthead@mmcoe.edu', '$2a$10$wT0vRz4E/W.f7Bln4g4u3.xN9jXoQjI9lXm0OqA/Osl0zBq0HqfG2', 2, 1, 'Head of Department / Mentor', 'active', 1),
(3, 'Arya Joshi', 'staff@mmcoe.edu', '$2a$10$wT0vRz4E/W.f7Bln4g4u3.xN9jXoQjI9lXm0OqA/Osl0zBq0HqfG2', 5, 1, 'Department Staff & Asset Incharge', 'active', 1)
ON DUPLICATE KEY UPDATE email = VALUES(email), role_id = VALUES(role_id);

-- 10. SEED RECEIPTS
INSERT INTO receipts (receipt_id, receipt_code, receiving_type_id, supplier_id, supplier_name, invoice_number, invoice_date, receipt_date, quantity, unit_cost, total_cost, receiving_remarks, received_by, approval_status) VALUES
(1, 'REC-2026-001001', 1, 1, 'Dell Technologies India', 'INV-DEL-8921', '2026-08-01', '2026-08-05', 5, 65000.00, 325000.00, 'Batch of Dell OptiPlex workstations for Lab 505', 1, 'approved'),
(2, 'REC-2026-001002', 1, 2, 'HP Enterprise Solutions', 'HPE-IN-4421', '2026-08-10', '2026-08-12', 2, 120000.00, 240000.00, 'HP ProLiant Rack Servers for Server Room', 1, 'approved'),
(3, 'REC-2026-001003', 1, 4, 'Cisco Systems India', 'CISCO-PO-771', '2026-08-15', '2026-08-18', 4, 38000.00, 152000.00, 'Cisco Gigabit 24-Port Managed Switches', 1, 'approved')
ON DUPLICATE KEY UPDATE receipt_code = VALUES(receipt_code);

-- 11. SEED ASSETS
INSERT INTO assets (asset_id, asset_code, name, make, model, serial_number, category_id, receipt_id, department_id, location_id, custodian_id, condition_id, status, purchase_date, cost, warranty_expiry, barcode_value, qr_payload, remarks) VALUES
(1, 'AST-2026-001001', 'Dell OptiPlex 7090 Desktop', 'Dell', 'OptiPlex 7090', 'SN-DEL-70901', 2, 1, 1, 1, 1, 2, 'available', '2026-08-01', 65000.00, '2029-08-01', 'AST-2026-001001', '{"code":"AST-2026-001001","name":"Dell OptiPlex 7090 Desktop","dept":"Computer Engineering"}', 'Primary lab workstation'),
(2, 'AST-2026-001002', 'Dell OptiPlex 7090 Desktop', 'Dell', 'OptiPlex 7090', 'SN-DEL-70902', 2, 1, 1, 1, 3, 2, 'assigned', '2026-08-01', 65000.00, '2029-08-01', 'AST-2026-001002', '{"code":"AST-2026-001002","name":"Dell OptiPlex 7090 Desktop","dept":"Computer Engineering"}', 'Assigned to faculty lab desk'),
(3, 'AST-2026-001003', 'HP ProLiant DL380 Server', 'HP', 'ProLiant DL380 Gen10', 'SN-HPE-38001', 4, 2, 1, 9, 1, 1, 'available', '2026-08-10', 120000.00, '2031-08-10', 'AST-2026-001003', '{"code":"AST-2026-001003","name":"HP ProLiant DL380 Server","dept":"Computer Engineering"}', 'Department Virtualization Host'),
(4, 'AST-2026-001004', 'Cisco Catalyst 2960-X Switch', 'Cisco', 'WS-C2960X-24TS-L', 'SN-CSC-29601', 6, 3, 1, 3, 1, 2, 'available', '2026-08-15', 38000.00, '2029-08-15', 'AST-2026-001004', '{"code":"AST-2026-001004","name":"Cisco Catalyst 2960-X Switch","dept":"Computer Engineering"}', 'Lab II Core Switch'),
(5, 'AST-2026-001005', 'Lenovo ThinkPad E14 Gen 4', 'Lenovo', 'ThinkPad E14', 'SN-LNV-E1401', 1, 1, 1, 4, 2, 2, 'assigned', '2026-07-20', 72000.00, '2029-07-20', 'AST-2026-001005', '{"code":"AST-2026-001005","name":"Lenovo ThinkPad E14 Gen 4","dept":"Computer Engineering"}', 'Issued to HOD'),
(6, 'AST-2026-001006', 'Epson EB-E01 XGA Projector', 'Epson', 'EB-E01', 'SN-EPS-99120', 7, 1, 1, 6, 3, 4, 'maintenance', '2025-06-15', 34000.00, '2027-06-15', 'AST-2026-001006', '{"code":"AST-2026-001006","name":"Epson EB-E01 XGA Projector","dept":"Computer Engineering"}', 'Lamp flicker issue reported')
ON DUPLICATE KEY UPDATE asset_code = VALUES(asset_code);

-- 12. SEED ASSET TAGS
INSERT INTO asset_tags (tag_id, asset_id, barcode_value, tag_status) VALUES
(1, 1, 'AST-2026-001001', 'applied'),
(2, 2, 'AST-2026-001002', 'applied'),
(3, 3, 'AST-2026-001003', 'applied'),
(4, 4, 'AST-2026-001004', 'applied'),
(5, 5, 'AST-2026-001005', 'applied'),
(6, 6, 'AST-2026-001006', 'damaged')
ON DUPLICATE KEY UPDATE barcode_value = VALUES(barcode_value);

-- 13. SEED DISPOSAL REQUESTS
INSERT INTO disposal_requests (request_id, asset_id, request_type, reason, disposal_method, book_value, requested_by, approved_by, request_date, status, remarks) VALUES
(1, 6, 'disposal', 'Repeated bulb failure and beyond economical repair warranty', 'e-waste auction', 4500.00, 'Arya Joshi', NULL, '2026-09-01 10:00:00', 'pending', 'Awaiting HOD inspection and approval')
ON DUPLICATE KEY UPDATE reason = VALUES(reason);

SET FOREIGN_KEY_CHECKS = 1;
