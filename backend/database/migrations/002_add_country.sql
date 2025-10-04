-- Migration: Add country field to users
-- Date: 2024-01-16

ALTER TABLE users ADD COLUMN country VARCHAR(100);