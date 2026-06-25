const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// ===== API Routes =====

// GET /api — Welcome message
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Event Feedback API' });
});

// POST /api/feedback — Submit new feedback
app.post('/api/feedback', (req, res) => {
  const { name, email, event, rating, comments } = req.body;

  // Server-side validation
  const errors = [];
  if (!name || !name.trim()) errors.push('Name is required.');
  if (!email || !email.trim()) errors.push('Email is required.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format.');
  if (!event || !event.trim()) errors.push('Event selection is required.');
  if (!rating || isNaN(rating) || rating < 1 || rating > 5) errors.push('Rating must be between 1 and 5.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO feedback (name, email, event, rating, comments)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email.trim(),
      event.trim(),
      parseInt(rating, 10),
      (comments || '').trim()
    );

    // Fetch the inserted row to return it
    const inserted = db.prepare('SELECT * FROM feedback WHERE id = ?').get(result.lastInsertRowid);

    console.log(`📝 New feedback from ${name} for "${event}" — Rating: ${rating}/5`);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      data: inserted
    });
  } catch (err) {
    console.error('❌ Error saving feedback:', err.message);
    res.status(500).json({
      success: false,
      errors: ['Internal server error. Please try again later.']
    });
  }
});

// GET /api/feedback — Retrieve all feedback entries
app.get('/api/feedback', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM feedback ORDER BY id DESC').all();
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('❌ Error fetching feedback:', err.message);
    res.status(500).json({
      success: false,
      errors: ['Internal server error. Please try again later.']
    });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`\n🚀 EventPulse server running at http://localhost:${PORT}\n`);
});
