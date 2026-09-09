-- =====================================================
-- Department Asset Tracking and Barcode Reader
-- Database Schema
-- Database: MySQL
-- =====================================================

CREATE DATABASE IF NOT EXISTS asset_tracking_db;

USE asset_tracking_db;


-- =====================================================
-- 1. ROLES
-- =====================================================

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 2. DEPARTMENTS
-- =====================================================

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 3. USERS
-- =====================================================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role_id INT NOT NULL,
    department_id INT,

    designation VARCHAR(100),
    phone VARCHAR(20),

    status ENUM('active', 'suspended')
        DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);


-- =====================================================
-- 4. LOCATIONS
-- =====================================================

CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    department_id INT,

    type ENUM('room', 'floor', 'site') NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_locations_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);


-- =====================================================
-- 5. ASSETS
-- =====================================================

CREATE TABLE assets (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,

    asset_code VARCHAR(50) NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    make VARCHAR(100),
    model VARCHAR(100),

    serial_number VARCHAR(100) UNIQUE,

    category VARCHAR(100),

    department_id INT,
    location_id INT,
    custodian_id INT,

    status ENUM(
        'available',
        'assigned',
        'maintenance',
        'damaged',
        'lost',
        'disposed'
    ) DEFAULT 'available',

    purchase_date DATE,

    cost DECIMAL(12,2),

    warranty_expiry DATE,

    asset_condition ENUM(
        'new',
        'good',
        'fair',
        'damaged',
        'poor'
    ) DEFAULT 'new',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_assets_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id),

    CONSTRAINT fk_assets_location
        FOREIGN KEY (location_id)
        REFERENCES locations(location_id),

    CONSTRAINT fk_assets_custodian
        FOREIGN KEY (custodian_id)
        REFERENCES users(user_id)
);


-- =====================================================
-- 6. ASSET TAGS / BARCODES
-- =====================================================

CREATE TABLE asset_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    barcode_value VARCHAR(150) NOT NULL UNIQUE,

    tag_status ENUM(
        'printed',
        'issued',
        'applied',
        'damaged',
        'replaced'
    ) DEFAULT 'printed',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_asset_tags_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id)
);


-- =====================================================
-- DATABASE COMPLETE
-- =====================================================
