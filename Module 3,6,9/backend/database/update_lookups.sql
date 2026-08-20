-- =====================================================
-- Update departments and locations (labs)
-- =====================================================

USE asset_tracking_db;

-- Clear existing departments and locations (locations reference departments via FK)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE locations;
TRUNCATE TABLE departments;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DEPARTMENTS
-- =====================================================

INSERT INTO departments (name) VALUES
('Computer Engineering'),
('Mechanical'),
('Information Technology'),
('ENTC'),
('Electrical');

-- =====================================================
-- LOCATIONS (Labs) — linked to all departments (NULL = shared/common)
-- =====================================================

INSERT INTO locations (name, department_id, type) VALUES
('MB 505',  NULL, 'room'),
('MB 508-I',  NULL, 'room'),
('MB 508-II', NULL, 'room'),
('MB 501',  NULL, 'room'),
('MB 502',  NULL, 'room'),
('MB 503',  NULL, 'room'),
('MB 504',  NULL, 'room'),
('MB 514',  NULL, 'room');
