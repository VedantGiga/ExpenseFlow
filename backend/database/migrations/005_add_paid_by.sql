-- Migration: Add paid_by field to expenses
-- Date: 2024-01-16

ALTER TABLE expenses ADD COLUMN paid_by VARCHAR(255);