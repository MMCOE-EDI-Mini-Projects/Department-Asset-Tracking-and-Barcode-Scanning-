USE asset_tracking_db;

INSERT INTO roles (role_name, permissions) VALUES
('asset_admin', '{"all": true}'),
('dept_head', '{"approve_transfer": true, "approve_disposal": true}'),
('scanner_operator', '{"scan": true, "verify": true}'),
('auditor', '{"audit": true, "verify": true}'),
('staff', '{"view": true, "scan": true}');

INSERT INTO departments (name) VALUES
('Computer Engineering'),
('Information Technology'),
('Electronics Engineering'),
('Administration'),
('Library');

INSERT INTO locations (name, department_id, type) VALUES
('Room 101', 1, 'room'),
('Room 102', 1, 'room'),
('IT Lab 1', 2, 'room'),
('Main Office', 4, 'room'),
('First Floor', 1, 'floor');
