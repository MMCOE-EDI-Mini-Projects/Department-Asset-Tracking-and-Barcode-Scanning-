-- =====================================================
-- Additional seed data (on top of the provided seed.sql)
-- Sample assets and their tags/barcodes, for demonstration.
-- Run this AFTER seed.sql and disposal_requests.sql
-- =====================================================

USE asset_tracking_db;

INSERT INTO assets
    (asset_code, name, make, model, serial_number, category, department_id, location_id, status, purchase_date, asset_condition)
VALUES
    ('CE-LAB3-042', 'Dell OptiPlex', 'Dell', 'OptiPlex 7090', 'DELL12345', 'Desktop', 1, 1, 'available', '2023-06-15', 'good'),
    ('CE-LAB1-011', 'HP LaserJet Printer', 'HP', 'LaserJet Pro M404', 'HP998877', 'Printer', 1, 2, 'available', '2022-11-02', 'fair'),
    ('CE-STAFF-007', 'Lenovo ThinkPad', 'Lenovo', 'ThinkPad T14', 'LEN55221', 'Laptop', 1, 4, 'available', '2024-01-20', 'good');

INSERT INTO asset_tags (asset_id, barcode_value, tag_status)
SELECT asset_id, asset_code, 'applied' FROM assets
WHERE asset_code IN ('CE-LAB3-042', 'CE-LAB1-011', 'CE-STAFF-007');
