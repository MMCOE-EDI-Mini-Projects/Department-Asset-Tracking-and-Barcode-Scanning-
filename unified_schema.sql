-- =====================================================================
-- Department Asset Tracking and Barcode Scanning System
-- Complete Unified Database Schema (Modules 2, 3, 4, 5, 6, 7, 8, 9)
-- Database: MySQL 8.0+
-- =====================================================================

DROP DATABASE IF EXISTS asset_tracking_db;
CREATE DATABASE asset_tracking_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE asset_tracking_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLES
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. DEPARTMENTS
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. LOCATIONS
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department_id INT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'room',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_locations_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. CATEGORIES
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(10) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    useful_life_years INT DEFAULT 5,
    depreciation_rate DECIMAL(5,2) DEFAULT 10.00,
    requires_serial TINYINT(1) DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. SUPPLIERS
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL UNIQUE,
    contact_person VARCHAR(100) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    address TEXT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. ASSET CONDITIONS
CREATE TABLE asset_conditions (
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    condition_name VARCHAR(50) NOT NULL UNIQUE,
    blocks_usage TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 7. RECEIVING TYPES
CREATE TABLE receiving_types (
    receiving_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    needs_invoice TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 8. USERS
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT NULL,
    designation VARCHAR(100) NULL,
    phone VARCHAR(30) NULL,
    status VARCHAR(20) DEFAULT 'active',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. CODE SEQUENCES
CREATE TABLE code_sequences (
    seq_key VARCHAR(50) PRIMARY KEY,
    current_value BIGINT NOT NULL DEFAULT 1000
) ENGINE=InnoDB;

-- 10. RECEIPTS (Module 4)
CREATE TABLE receipts (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_code VARCHAR(50) NOT NULL UNIQUE,
    receiving_type_id INT NULL,
    supplier_id INT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    invoice_number VARCHAR(100) NULL,
    invoice_date DATE NULL,
    receipt_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_cost DECIMAL(12,2) DEFAULT 0.00,
    total_cost DECIMAL(14,2) DEFAULT 0.00,
    receiving_remarks TEXT NULL,
    received_by INT NOT NULL,
    approval_status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipts_type
        FOREIGN KEY (receiving_type_id) REFERENCES receiving_types(receiving_type_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_receipts_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_receipts_receiver
        FOREIGN KEY (received_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 11. ASSETS (Core table unifying Modules 3, 4, 5, 6, 9)
CREATE TABLE assets (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    make VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    serial_number VARCHAR(100) NULL UNIQUE,
    category_id INT NULL,
    receipt_id INT NULL,
    department_id INT NULL,
    location_id INT NULL,
    custodian_id INT NULL,
    condition_id INT NULL,
    status VARCHAR(30) DEFAULT 'available',
    purchase_date DATE NULL,
    cost DECIMAL(12,2) DEFAULT 0.00,
    warranty_expiry DATE NULL,
    barcode_value VARCHAR(150) NULL,
    qr_payload TEXT NULL,
    remarks TEXT NULL,
    requires_approval TINYINT(1) DEFAULT 0,
    registered_by INT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assets_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_receipt
        FOREIGN KEY (receipt_id) REFERENCES receipts(receipt_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_custodian
        FOREIGN KEY (custodian_id) REFERENCES users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_condition
        FOREIGN KEY (condition_id) REFERENCES asset_conditions(condition_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. ASSET TAGS / BARCODES (Module 6)
CREATE TABLE asset_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    barcode_value VARCHAR(150) NOT NULL UNIQUE,
    tag_status VARCHAR(30) DEFAULT 'printed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tags_asset
        FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. ASSET ASSIGNMENTS (Module 5 & 7)
CREATE TABLE asset_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    custodian_id INT NULL,
    department_id INT NULL,
    location_id INT NULL,
    assigned_date DATE NOT NULL,
    assigned_by INT NOT NULL,
    assignment_status VARCHAR(30) DEFAULT 'active',
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_custodian FOREIGN KEY (custodian_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_assign_dept FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    CONSTRAINT fk_assign_loc FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    CONSTRAINT fk_assign_by FOREIGN KEY (assigned_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 14. ASSET TRANSFERS (Module 5 & 7)
CREATE TABLE asset_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    from_department_id INT NULL,
    to_department_id INT NULL,
    from_location_id INT NULL,
    to_location_id INT NULL,
    from_custodian_id INT NULL,
    to_custodian_id INT NULL,
    transfer_date DATE NOT NULL,
    handover_user_id INT NOT NULL,
    receiver_user_id INT NOT NULL,
    barcode_value VARCHAR(100) NULL,
    barcode_verified TINYINT(1) DEFAULT 0,
    approval_status VARCHAR(30) DEFAULT 'approved',
    transfer_status VARCHAR(30) DEFAULT 'completed',
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trans_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    CONSTRAINT fk_trans_from_dept FOREIGN KEY (from_department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    CONSTRAINT fk_trans_to_dept FOREIGN KEY (to_department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    CONSTRAINT fk_trans_from_loc FOREIGN KEY (from_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    CONSTRAINT fk_trans_to_loc FOREIGN KEY (to_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    CONSTRAINT fk_trans_from_cust FOREIGN KEY (from_custodian_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_trans_to_cust FOREIGN KEY (to_custodian_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_trans_handover FOREIGN KEY (handover_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_trans_receiver FOREIGN KEY (receiver_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 15. DISPOSAL & WRITE-OFF REQUESTS (Module 9)
CREATE TABLE disposal_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    request_type VARCHAR(30) DEFAULT 'disposal',
    reason TEXT NULL,
    disposal_method VARCHAR(100) NULL,
    book_value DECIMAL(12,2) NULL,
    requested_by VARCHAR(100) NULL,
    approved_by VARCHAR(100) NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    disposal_date TIMESTAMP NULL,
    write_off_date TIMESTAMP NULL,
    status VARCHAR(30) DEFAULT 'pending',
    remarks TEXT NULL,
    CONSTRAINT fk_disposal_asset
        FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. AUDIT LOG (Module 8 & System Tracking)
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    field_changed VARCHAR(100) NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    performed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 17. MAINTENANCE & REPAIR TICKETS (Module 7)
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    ticket_id       INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code     VARCHAR(40) NOT NULL UNIQUE,
    asset_id        INT NOT NULL,
    problem_desc    TEXT NOT NULL,
    technician      VARCHAR(120),
    ticket_status   ENUM('open','in_progress','closed') NOT NULL DEFAULT 'open',
    service_date    DATE,
    service_cost    DECIMAL(12,2),
    service_remarks TEXT,
    created_by      INT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_maint_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    CONSTRAINT fk_maint_user FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 18. INVENTORY AUDIT CYCLES & ITEMS (Module 8)
CREATE TABLE IF NOT EXISTS audit_cycles (
    audit_id        INT AUTO_INCREMENT PRIMARY KEY,
    audit_name      VARCHAR(160) NOT NULL,
    department_id   INT,
    location_id     INT,
    audit_status    ENUM('open','completed') NOT NULL DEFAULT 'open',
    created_by      INT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME,
    CONSTRAINT fk_audit_dept FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_loc FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_items (
    audit_item_id       INT AUTO_INCREMENT PRIMARY KEY,
    audit_id            INT NOT NULL,
    asset_id            INT NOT NULL,
    verification_status ENUM('found','missing','misplaced','damaged','not_accessible') DEFAULT NULL,
    comments            TEXT,
    scanned_at          DATETIME,
    CONSTRAINT fk_item_audit FOREIGN KEY (audit_id) REFERENCES audit_cycles(audit_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

