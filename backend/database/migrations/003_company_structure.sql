-- Migration: Add company structure and manager relationships
-- Date: 2024-01-16

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update users table
ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id);
ALTER TABLE users ADD COLUMN manager_id INTEGER REFERENCES users(id);

-- Update existing users to have a default company
INSERT INTO companies (name, country, currency) VALUES ('Default Company', 'United States', 'USD');
UPDATE users SET company_id = 1 WHERE company_id IS NULL;