USE asset_tracking_db;
INSERT IGNORE INTO departments (name) VALUES ('Unassigned');
SET @unassigned_dept := (SELECT department_id FROM departments WHERE name = 'Unassigned' LIMIT 1);
INSERT IGNORE INTO locations (name, department_id, type) VALUES ('Unassigned', @unassigned_dept, 'room');
SET @unassigned_loc := (SELECT location_id FROM locations WHERE name = 'Unassigned' LIMIT 1);
UPDATE assets SET department_id = @unassigned_dept WHERE department_id IS NULL;
UPDATE assets SET location_id = @unassigned_loc WHERE location_id IS NULL;
ALTER TABLE assets MODIFY department_id INT NOT NULL;
ALTER TABLE assets MODIFY location_id INT NOT NULL;
