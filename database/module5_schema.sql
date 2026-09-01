-- =====================================================
-- Module 5: Asset Assignment & Transfer
-- Database additions
-- =====================================================

USE asset_tracking_db;


-- =====================================================
-- 1. ASSET ASSIGNMENTS
-- =====================================================

CREATE TABLE asset_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    custodian_id INT,

    department_id INT,

    location_id INT,

    assigned_date DATE NOT NULL,

    assigned_by INT NOT NULL,

    assignment_status ENUM(
        'active',
        'returned',
        'cancelled'
    ) DEFAULT 'active',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_asset_assignments_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id),

    CONSTRAINT fk_asset_assignments_custodian
        FOREIGN KEY (custodian_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_asset_assignments_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id),

    CONSTRAINT fk_asset_assignments_location
        FOREIGN KEY (location_id)
        REFERENCES locations(location_id),

    CONSTRAINT fk_asset_assignments_user
        FOREIGN KEY (assigned_by)
        REFERENCES users(user_id)
);


-- =====================================================
-- 2. ASSET TRANSFERS
-- =====================================================

CREATE TABLE asset_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    from_department_id INT,
    to_department_id INT,

    from_location_id INT,
    to_location_id INT,

    from_custodian_id INT,
    to_custodian_id INT,

    transfer_date DATE NOT NULL,

    handover_user_id INT NOT NULL,

    receiver_user_id INT NOT NULL,

    barcode_value VARCHAR(100),

    barcode_verified BOOLEAN DEFAULT FALSE,

    approval_status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending',

    transfer_status ENUM(
        'initiated',
        'approved',
        'completed',
        'cancelled'
    ) DEFAULT 'initiated',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_asset_transfers_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id),

    CONSTRAINT fk_asset_transfers_from_department
        FOREIGN KEY (from_department_id)
        REFERENCES departments(department_id),

    CONSTRAINT fk_asset_transfers_to_department
        FOREIGN KEY (to_department_id)
        REFERENCES departments(department_id),

    CONSTRAINT fk_asset_transfers_from_location
        FOREIGN KEY (from_location_id)
        REFERENCES locations(location_id),

    CONSTRAINT fk_asset_transfers_to_location
        FOREIGN KEY (to_location_id)
        REFERENCES locations(location_id),

    CONSTRAINT fk_asset_transfers_from_custodian
        FOREIGN KEY (from_custodian_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_asset_transfers_to_custodian
        FOREIGN KEY (to_custodian_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_asset_transfers_handover_user
        FOREIGN KEY (handover_user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_asset_transfers_receiver_user
        FOREIGN KEY (receiver_user_id)
        REFERENCES users(user_id)
);


-- =====================================================
-- 3. INDEXES FOR FASTER ASSET HISTORY LOOKUP
-- =====================================================

CREATE INDEX idx_asset_assignments_asset
    ON asset_assignments(asset_id);

CREATE INDEX idx_asset_transfers_asset
    ON asset_transfers(asset_id);

CREATE INDEX idx_asset_transfers_date
    ON asset_transfers(transfer_date);

CREATE INDEX idx_asset_transfers_barcode
    ON asset_transfers(barcode_value);