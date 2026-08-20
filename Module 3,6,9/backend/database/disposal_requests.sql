-- =====================================================
-- Extension on top of the provided schema.sql
-- Adds what Module 9 (Disposal and Write-off Management)
-- needs, since the original schema tracks asset "status"
-- but has no disposal request / approval workflow table.
-- Run this AFTER schema.sql
-- =====================================================

USE asset_tracking_db;

CREATE TABLE IF NOT EXISTS disposal_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    reason TEXT,
    disposal_method VARCHAR(100),

    requested_by VARCHAR(100),
    approved_by VARCHAR(100),

    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    disposal_date TIMESTAMP NULL,

    status ENUM('pending', 'approved', 'disposed') DEFAULT 'pending',

    remarks TEXT,

    CONSTRAINT fk_disposal_requests_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id)
);
