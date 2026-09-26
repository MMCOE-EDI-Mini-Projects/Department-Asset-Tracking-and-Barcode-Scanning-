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
--
-- Used to generate asset codes such as:
--
-- CE-508-LAP-0001
-- CE-508-LAP-0002
-- CE-508-MON-0001
--
-- Sequence is maintained separately for:
-- Department + Location + Category
-- =====================================================

CREATE TABLE asset_code_sequences (
    department_code VARCHAR(10) NOT NULL,

    location_code VARCHAR(20) NOT NULL,

    category_code VARCHAR(10) NOT NULL,

    next_number INT NOT NULL DEFAULT 1,

    PRIMARY KEY (
        department_code,
        location_code,
        category_code
    )
);


-- =====================================================
-- 3. INITIAL ASSET CODE SEQUENCES
--
-- Department:
-- CE = Computer Engineering
--
-- Location:
-- 501
--
-- Categories:
-- DES = Desktop
-- MON = Monitor
-- MOU = Mouse
-- KB  = Keyboard
-- LAP = Laptop
-- PRO = Projector
-- SB  = Smartboard
-- CPU = CPU
-- FUR = Furniture
-- OTH = Other
-- =====================================================

INSERT INTO asset_code_sequences
(
    department_code,
    location_code,
    category_code,
    next_number
)
VALUES
('CE', '501', 'CPU', 1),
('CE', '501', 'DES', 1),
('CE', '501', 'FUR', 1),
('CE', '501', 'KB',  1),
('CE', '501', 'LAP', 1),
('CE', '501', 'MON', 1),
('CE', '501', 'MOU', 1),
('CE', '501', 'OTH', 1),
('CE', '501', 'PRO', 1),
('CE', '501', 'SB',  1);


-- =====================================================
-- END OF MODULE 4 DATABASE
-- =====================================================