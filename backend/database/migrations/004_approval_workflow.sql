-- Migration: Approval workflow system
-- Date: 2024-01-16

-- Approval rules table
CREATE TABLE approval_rules (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_amount DECIMAL(10,2),
    percentage_threshold INTEGER, -- e.g., 60 for 60%
    specific_approver_id INTEGER REFERENCES users(id),
    is_hybrid BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval steps table
CREATE TABLE approval_steps (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES approval_rules(id),
    step_order INTEGER NOT NULL,
    approver_id INTEGER REFERENCES users(id),
    is_manager_step BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update expenses table
ALTER TABLE expenses ADD COLUMN original_currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE expenses ADD COLUMN exchange_rate DECIMAL(10,4) DEFAULT 1.0000;
ALTER TABLE expenses ADD COLUMN company_currency_amount DECIMAL(10,2);
ALTER TABLE expenses ADD COLUMN current_step INTEGER DEFAULT 1;
ALTER TABLE expenses ADD COLUMN approval_rule_id INTEGER REFERENCES approval_rules(id);

-- Expense approvals table
CREATE TABLE expense_approvals (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER REFERENCES expenses(id),
    approver_id INTEGER REFERENCES users(id),
    step_order INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add manager approver flag to users
ALTER TABLE users ADD COLUMN is_manager_approver BOOLEAN DEFAULT false;