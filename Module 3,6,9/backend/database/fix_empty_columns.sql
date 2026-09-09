USE asset_tracking_db;
UPDATE assets SET category = 'Unspecified' WHERE category IS NULL OR category = '';
UPDATE assets SET make = 'Unspecified' WHERE make IS NULL OR make = '';
UPDATE assets SET model = 'Unspecified' WHERE model IS NULL OR model = '';
UPDATE assets SET serial_number = CONCAT('UNKNOWN-', asset_id) WHERE serial_number IS NULL OR serial_number = '';
ALTER TABLE assets MODIFY category VARCHAR(100) NOT NULL;
ALTER TABLE assets MODIFY make VARCHAR(100) NOT NULL;
ALTER TABLE assets MODIFY model VARCHAR(100) NOT NULL;
ALTER TABLE assets MODIFY serial_number VARCHAR(100) NOT NULL;

UPDATE disposal_requests SET reason = 'Not specified' WHERE reason IS NULL OR reason = '';
UPDATE disposal_requests SET disposal_method = 'Not specified' WHERE disposal_method IS NULL OR disposal_method = '';
UPDATE disposal_requests SET requested_by = 'Not specified' WHERE requested_by IS NULL OR requested_by = '';
ALTER TABLE disposal_requests MODIFY reason TEXT NOT NULL;
ALTER TABLE disposal_requests MODIFY disposal_method VARCHAR(100) NOT NULL;
ALTER TABLE disposal_requests MODIFY requested_by VARCHAR(100) NOT NULL;
