-- Personal Wardrobe Tracker Schema (PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clothing Table
CREATE TABLE IF NOT EXISTS clothing (
    clothing_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    style VARCHAR(50),
    material VARCHAR(50),
    image_url TEXT,
    wash_threshold INTEGER NOT NULL DEFAULT 2,
    current_wear_count INTEGER NOT NULL DEFAULT 0,
    lifetime_wear_count INTEGER NOT NULL DEFAULT 0,
    last_worn TIMESTAMP WITH TIME ZONE,
    last_washed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wear History Table
CREATE TABLE IF NOT EXISTS wear_history (
    wear_id SERIAL PRIMARY KEY,
    clothing_id INTEGER NOT NULL REFERENCES clothing(clothing_id) ON DELETE CASCADE,
    worn_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wash History Table
CREATE TABLE IF NOT EXISTS wash_history (
    wash_id SERIAL PRIMARY KEY,
    clothing_id INTEGER NOT NULL REFERENCES clothing(clothing_id) ON DELETE CASCADE,
    wash_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_clothing_user_id ON clothing(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_category ON clothing(category);
CREATE INDEX IF NOT EXISTS idx_wear_history_clothing_id ON wear_history(clothing_id);
CREATE INDEX IF NOT EXISTS idx_wash_history_clothing_id ON wash_history(clothing_id);
CREATE INDEX IF NOT EXISTS idx_clothing_last_worn ON clothing(last_worn);
CREATE INDEX IF NOT EXISTS idx_clothing_current_wear ON clothing(current_wear_count);
