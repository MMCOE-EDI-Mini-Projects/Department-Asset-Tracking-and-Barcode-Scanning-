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
-- Used to generate asset codes such as:
-- CE-508-LAP-0001
-- CE-508-LAP-0002
-- CE-508-MON-0001
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
-- Computer Engineering (CE)
-- Locations 501 to 514
-- =====================================================

INSERT INTO asset_code_sequences
(
    department_code,
    location_code,
    category_code,
    next_number
)
VALUES
('CE', '501', 'LAP', 1),
('CE', '502', 'LAP', 1),
('CE', '503', 'LAP', 1),
('CE', '504', 'LAP', 1),
('CE', '505', 'LAP', 1),
('CE', '506', 'LAP', 1),
('CE', '507', 'LAP', 1),
('CE', '508', 'LAP', 1),
('CE', '509', 'LAP', 1),
('CE', '510', 'LAP', 1),
('CE', '511', 'LAP', 1),
('CE', '512', 'LAP', 1),
('CE', '513', 'LAP', 1),
('CE', '514', 'LAP', 1);


-- =====================================================
-- END OF MODULE 4 DATABASE
-- =====================================================