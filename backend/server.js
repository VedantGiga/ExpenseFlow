import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database/db.js';
import { authenticateToken } from './middleware/auth.js';
import { createApprovalWorkflow, processApproval } from './services/approvalService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected!', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get currency for country
const getCurrencyForCountry = async (country) => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${country}?fields=currencies`);
    const data = await response.json();
    return Object.keys(data[0]?.currencies || {})[0] || 'USD';
  } catch {
    return 'USD';
  }
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { companyName, email, password, country } = req.body;
  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const currency = await getCurrencyForCountry(country);
    
    // Set company base currency in environment
    process.env.COMPANY_BASE_CURRENCY = currency;
    
    // Create company
    const companyResult = await pool.query(
      'INSERT INTO companies (name, country, currency) VALUES ($1, $2, $3) RETURNING id',
      [companyName, country, currency]
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, country, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [companyName, email, hashedPassword, 'admin', country, companyResult.rows[0].id]
    );

    const token = jwt.sign({ userId: userResult.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: userResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, company_id FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get expenses (role-based)
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    let query, params;
    
    if (req.user.role === 'admin') {
      query = `
        SELECT e.*, u.name as user_name, c.currency as company_currency
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.company_id = $1
        ORDER BY e.created_at DESC
      `;
      params = [req.user.company_id];
    } else if (req.user.role === 'manager') {
      query = `
        SELECT e.*, u.name as user_name, c.currency as company_currency
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE (u.manager_id = $1 OR u.id = $1) AND u.company_id = $2
        ORDER BY e.created_at DESC
      `;
      params = [req.user.id, req.user.company_id];
    } else {
      query = `
        SELECT e.*, u.name as user_name, c.currency as company_currency
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE e.user_id = $1
        ORDER BY e.created_at DESC
      `;
      params = [req.user.id];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { amount, category, description, expense_date, original_currency } = req.body;
  const user_id = req.user.id;
  try {
    // Get company currency for conversion
    const company = await pool.query('SELECT currency FROM companies WHERE id = $1', [req.user.company_id]);
    const companyCurrency = company.rows[0]?.currency || process.env.COMPANY_BASE_CURRENCY || 'USD';
    
    // Get real exchange rate
    let exchangeRate = 1.0;
    let companyAmount = amount;
    
    if (original_currency && original_currency !== companyCurrency) {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/84f73baaf9024876f249e20b/latest/${original_currency}`);
      const data = await response.json();
      exchangeRate = data.conversion_rates[companyCurrency];
      companyAmount = Math.round(amount * exchangeRate * 100) / 100;
    }

    const result = await pool.query(
      'INSERT INTO expenses (user_id, amount, category, description, expense_date, original_currency, exchange_rate, company_currency_amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [user_id, amount, category, description, expense_date, original_currency || companyCurrency, exchangeRate, companyAmount, 'pending']
    );

    // Create approval workflow
    await createApprovalWorkflow(result.rows[0].id, req.user.company_id, companyAmount);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending approvals for current user
app.get('/api/approvals', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;
    
    if (req.user.role === 'manager') {
      // For managers, show expenses from their assigned employees that need approval
      query = `
        SELECT e.*, u.name as employee_name, c.currency as company_currency,
               e.original_currency, e.amount, e.company_currency_amount,
               e.category, e.status, e.expense_date, e.description
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        JOIN companies c ON u.company_id = c.id
        WHERE u.manager_id = $1 AND e.status = 'pending' AND u.company_id = $2
        ORDER BY e.created_at DESC
      `;
      params = [req.user.id, req.user.company_id];
    } else {
      // For other roles, use the existing approval workflow logic
      query = `
        SELECT e.*, u.name as employee_name, ea.comments, ea.step_order, c.currency as company_currency
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        JOIN expense_approvals ea ON e.id = ea.expense_id
        JOIN companies c ON u.company_id = c.id
        WHERE ea.approver_id = $1 AND ea.status = 'pending' AND e.current_step = ea.step_order AND u.company_id = $2
        ORDER BY e.created_at DESC
      `;
      params = [req.user.id, req.user.company_id];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process approval
app.post('/api/approvals/:expenseId', authenticateToken, async (req, res) => {
  const { status, comments } = req.body;
  try {
    // Use approval workflow for all roles
    const result = await processApproval(req.params.expenseId, req.user.id, status, comments);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management routes
app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, email, role, manager_id } = req.body;
  try {
    // Generate temporary password that will be replaced when admin sends actual password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, company_id, manager_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, hashedTempPassword, role, req.user.company_id, manager_id || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query(
      'SELECT u.id, u.name, u.email, u.role, u.manager_id, m.name as manager_name FROM users u LEFT JOIN users m ON u.manager_id = m.id WHERE u.company_id = $1',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { role, manager_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1, manager_id = $2 WHERE id = $3 AND company_id = $4 RETURNING id, name, email, role',
      [role, manager_id || null, req.params.id, req.user.company_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approval rules management
app.get('/api/approval-rules', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const result = await pool.query(
      'SELECT ar.*, u.name as specific_approver_name FROM approval_rules ar LEFT JOIN users u ON ar.specific_approver_id = u.id WHERE ar.company_id = $1',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/approval-rules', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, min_amount, max_amount, percentage_threshold, specific_approver_id, is_hybrid, steps } = req.body;
  try {
    const ruleResult = await pool.query(
      'INSERT INTO approval_rules (company_id, name, min_amount, max_amount, percentage_threshold, specific_approver_id, is_hybrid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [req.user.company_id, name, min_amount, max_amount, percentage_threshold, specific_approver_id, is_hybrid]
    );
    
    // Add steps
    for (const step of steps || []) {
      await pool.query(
        'INSERT INTO approval_steps (rule_id, step_order, approver_id, is_manager_step) VALUES ($1, $2, $3, $4)',
        [ruleResult.rows[0].id, step.order, step.approver_id, step.is_manager_step]
      );
    }
    
    res.json({ id: ruleResult.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send password reset email
app.post('/api/users/:id/send-password', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const userId = req.params.id;
    const user = await pool.query('SELECT email FROM users WHERE id = $1 AND company_id = $2', [userId, req.user.company_id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate random password (8 characters with letters and numbers)
    const randomPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    // Update user password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);
    
    // Return password for EmailJS to send
    res.json({ 
      message: 'Password generated successfully', 
      email: user.rows[0].email,
      password: randomPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate OTP for forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Try to add OTP columns if they don't exist
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6), ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP');
    } catch (alterError) {
      console.log('OTP columns may already exist');
    }
    
    // Store OTP in database
    await pool.query('UPDATE users SET otp = $1, otp_expiry = $2 WHERE id = $3', [otp, otpExpiry, user.rows[0].id]);
    
    res.json({ 
      message: 'OTP sent successfully', 
      email: user.rows[0].email,
      name: user.rows[0].name,
      otp: otp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and reset password
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await pool.query('SELECT id, otp, otp_expiry FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    
    // Check if OTP is valid and not expired
    if (userData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    if (new Date() > new Date(userData.otp_expiry)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, otp = NULL, otp_expiry = NULL WHERE id = $2', [hashedPassword, userData.id]);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});