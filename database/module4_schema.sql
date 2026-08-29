-- =====================================================
-- Module 4: Asset Receiving & Registration
-- Database additions
-- =====================================================

USE asset_tracking_db;


-- =====================================================
-- 1. ASSET RECEIPTS
-- =====================================================

CREATE TABLE asset_receipts (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    receiving_type ENUM(
        'purchased',
        'transferred',
        'donated',
        'returned_from_maintenance'
    ) NOT NULL,

    supplier_source VARCHAR(150),

    invoice_number VARCHAR(100),

    receipt_date DATE NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    received_by INT NOT NULL,

    remarks TEXT,

    approval_status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'approved',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_asset_receipts_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id),

    CONSTRAINT fk_asset_receipts_user
        FOREIGN KEY (received_by)
        REFERENCES users(user_id)
);


-- =====================================================
-- 2. ASSET CODE SEQUENCES
-- =====================================================

CREATE TABLE asset_code_sequences (
    category_code VARCHAR(10) PRIMARY KEY,

    next_number INT NOT NULL DEFAULT 1
);


-- =====================================================
-- INITIAL CATEGORY PREFIXES
-- =====================================================

INSERT INTO asset_code_sequences
(category_code, next_number)
VALUES
('LAP', 1),
('DES', 1),
('MON', 1),
('PRI', 1),
('PRO', 1),
('FUR', 1),
('LAB', 1),
('OTH', 1);