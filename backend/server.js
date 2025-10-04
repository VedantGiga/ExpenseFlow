import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database/db.js';
import { authenticateToken } from './middleware/auth.js';

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
  const { name, email, password, country, companyName } = req.body;
  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const currency = await getCurrencyForCountry(country);
    
    // Create company
    const companyResult = await pool.query(
      'INSERT INTO companies (name, country, currency) VALUES ($1, $2, $3) RETURNING id',
      [companyName || `${name}'s Company`, country, currency]
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, country, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'admin', country, companyResult.rows[0].id]
    );

    const token = jwt.sign({ userId: userResult.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as user_name 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id 
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { amount, category, description, expense_date } = req.body;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO expenses (user_id, amount, category, description, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, amount, category, description, expense_date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending approvals
app.get('/api/approvals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as employee_name 
      FROM expenses e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.status = 'pending'
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management routes
app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, email, password, role, manager_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, company_id, manager_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, hashedPassword, role, req.user.company_id, manager_id || null]
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
      'SELECT u.id, u.name, u.email, u.role, m.name as manager_name FROM users u LEFT JOIN users m ON u.manager_id = m.id WHERE u.company_id = $1',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});