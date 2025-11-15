CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- V1: Initial table setup
-- =========================================

-- 1️⃣ User Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- use uuid_generate_v4() if using older Postgres
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL
);

-- 2️⃣ Event Entry Table
CREATE TABLE event_entries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- auto-generated ID
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    video_url VARCHAR(500)
);

-- 3️⃣ Tags Table
CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE
);

-- 4️⃣ Tag ↔ Event Entry (Many-to-Many)
CREATE TABLE tag_has_log (
    tag_id BIGINT NOT NULL,
    event_entry_id BIGINT NOT NULL,
    PRIMARY KEY (tag_id, event_entry_id),
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
    FOREIGN KEY (event_entry_id) REFERENCES event_entries (id) ON DELETE CASCADE
);
