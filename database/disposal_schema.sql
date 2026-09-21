-- =====================================================
-- Department Asset Tracking and Barcode Reader
-- Disposal and Write-off Management Schema
-- Database: MySQL
-- =====================================================

USE asset_tracking_db;

-- 1. Ensure assets table status ENUM includes 'written_off'
ALTER TABLE assets
MODIFY COLUMN status ENUM('available','assigned','maintenance','damaged','lost','disposed','written_off') DEFAULT 'available';

-- 2. Create disposal_requests table supporting both physical disposal and financial write-off
CREATE TABLE IF NOT EXISTS disposal_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    request_type ENUM('disposal', 'write_off') DEFAULT 'disposal',
    reason TEXT,
    disposal_method VARCHAR(100),
    book_value DECIMAL(12,2) NULL,
    requested_by VARCHAR(100),
    approved_by VARCHAR(100),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    disposal_date TIMESTAMP NULL,
    write_off_date TIMESTAMP NULL,
    status ENUM('pending', 'approved', 'disposed', 'written_off') DEFAULT 'pending',
    remarks TEXT,
    CONSTRAINT fk_disposal_requests_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);
