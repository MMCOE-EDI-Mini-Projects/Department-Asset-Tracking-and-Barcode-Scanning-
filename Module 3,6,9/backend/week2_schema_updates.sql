-- =====================================================
-- Week 2 schema update
-- Mentor feedback: handle missing and NULL columns.
-- department_id and location_id on `assets` were nullable,
-- which let equipment get registered with no owner department
-- or physical location. This backfills any existing NULLs into
-- a placeholder "Unassigned" record, then makes both columns
-- required going forward. Run this AFTER the Week 1 SQL files.
-- =====================================================

USE asset_tracking_db;

INSERT IGNORE INTO departments (name) VALUES ('Unassigned');

SET @unassigned_dept := (SELECT department_id FROM departments WHERE name = 'Unassigned' LIMIT 1);

INSERT IGNORE INTO locations (name, department_id, type)
VALUES ('Unassigned', @unassigned_dept, 'room');

SET @unassigned_loc := (SELECT location_id FROM locations WHERE name = 'Unassigned' LIMIT 1);

-- Backfill any assets registered without a department/location
UPDATE assets SET department_id = @unassigned_dept WHERE department_id IS NULL;
UPDATE assets SET location_id = @unassigned_loc WHERE location_id IS NULL;

-- Going forward, every asset must have a department and location
ALTER TABLE assets MODIFY department_id INT NOT NULL;
ALTER TABLE assets MODIFY location_id INT NOT NULL;

-- Verify no NULLs remain
SELECT COUNT(*) AS assets_with_null_dept FROM assets WHERE department_id IS NULL;
SELECT COUNT(*) AS assets_with_null_location FROM assets WHERE location_id IS NULL;
