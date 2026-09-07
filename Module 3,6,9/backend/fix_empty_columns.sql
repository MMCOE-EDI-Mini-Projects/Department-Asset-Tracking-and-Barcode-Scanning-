-- =====================================================
-- Fix remaining empty/NULL columns
-- Run this AFTER week2_schema_updates.sql
--
-- week2_schema_updates.sql already fixed department_id and
-- location_id. This migration fixes the other columns that were
-- being left empty because the registration form never collected
-- them (category, make, model, serial_number, purchase_date), and
-- the disposal form never collected requested_by, so it was always
-- NULL even though the column existed.
-- =====================================================

USE asset_tracking_db;

-- --- assets: backfill existing NULLs, then make required ---

-- category, make, model can safely share a placeholder (not unique)
UPDATE assets SET category = 'Unspecified' WHERE category IS NULL OR category = '';
UPDATE assets SET make = 'Unspecified' WHERE make IS NULL OR make = '';
UPDATE assets SET model = 'Unspecified' WHERE model IS NULL OR model = '';

-- serial_number is UNIQUE, so each backfilled row needs a distinct placeholder
UPDATE assets
SET serial_number = CONCAT('UNKNOWN-', asset_id)
WHERE serial_number IS NULL OR serial_number = '';

-- purchase_date has no safe default; today's date is used as a
-- placeholder and should be corrected by whoever registered the asset
UPDATE assets SET purchase_date = CURDATE() WHERE purchase_date IS NULL;

ALTER TABLE assets MODIFY category VARCHAR(100) NOT NULL;
ALTER TABLE assets MODIFY make VARCHAR(100) NOT NULL;
ALTER TABLE assets MODIFY model VARCHAR(100) NOT NULL;
ALTER TABLE assets MODIFY serial_number VARCHAR(100) NOT NULL;
ALTER TABLE assets MODIFY purchase_date DATE NOT NULL;

-- --- disposal_requests: backfill existing NULLs, then make required ---

UPDATE disposal_requests SET reason = 'Not specified' WHERE reason IS NULL OR reason = '';
UPDATE disposal_requests SET disposal_method = 'Not specified' WHERE disposal_method IS NULL OR disposal_method = '';
UPDATE disposal_requests SET requested_by = 'Not specified' WHERE requested_by IS NULL OR requested_by = '';

ALTER TABLE disposal_requests MODIFY reason TEXT NOT NULL;
ALTER TABLE disposal_requests MODIFY disposal_method VARCHAR(100) NOT NULL;
ALTER TABLE disposal_requests MODIFY requested_by VARCHAR(100) NOT NULL;

-- remarks, cost, warranty_expiry, custodian_id are intentionally left
-- nullable — they are genuinely optional/not yet in scope (custodian
-- requires authentication, which is still planned for a later week).

-- Verify no NULLs remain in the columns just fixed
SELECT
  SUM(category IS NULL) AS null_category,
  SUM(make IS NULL) AS null_make,
  SUM(model IS NULL) AS null_model,
  SUM(serial_number IS NULL) AS null_serial,
  SUM(purchase_date IS NULL) AS null_purchase_date
FROM assets;

SELECT
  SUM(reason IS NULL) AS null_reason,
  SUM(disposal_method IS NULL) AS null_method,
  SUM(requested_by IS NULL) AS null_requested_by
FROM disposal_requests;
