-- ExpenseFlow Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (email, password_hash, role, name) VALUES
('employee@test.com', '$2b$10$dummy', 'employee', 'John Doe'),
('manager@test.com', '$2b$10$dummy', 'manager', 'Jane Smith'),
('admin@test.com', '$2b$10$dummy', 'admin', 'Admin User');

INSERT INTO expenses (user_id, amount, category, description, expense_date) VALUES
(1, 150.00, 'travel', 'Business trip to client', '2024-01-15'),
(1, 45.50, 'meals', 'Team lunch', '2024-01-14');