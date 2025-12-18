const express = require('express');
const path = require('path');
const db = require('./bd.cjs');

const app = express();

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

function start() {
  try {
    // Don't wait for DB connection - start server immediately
    console.log('Starting database connection...');
    // Fire and forget DB connection - don't await
    db.connectDB().then(() => {
      console.log('DB connection completed');
    }).catch(err => {
      console.error('DB connection error:', err);
    });
    
    console.log('Setting up express middleware...');
    app.use(express.static(path.join(__dirname, 'dist')));

    app.use(express.json());

    app.get('/api/ping', (req, res) => {
      res.json({ ok: true });
    });

    // Signup endpoint — saves to MongoDB when available, otherwise returns 503
    app.post('/api/signup', async (req, res) => {
      const { email, username, password } = req.body || {};
      if (!email || !username || !password) {
        return res.status(400).json({ error: 'email, username and password are required' });
      }

      const database = db.getDb('sampledb');
      if (!database) {
        return res.status(503).json({ error: 'Database unavailable — signup not persisted' });
      }

      try {
        const users = database.collection('users');
        const result = await users.insertOne({ email, username, password, createdAt: new Date() });
        return res.status(201).json({ ok: true, id: result.insertedId });
      } catch (err) {
        console.error('Error inserting user', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }
    });

    // serve SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    console.log(`Attempting to start server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      console.log(`✅ Server is listening on port ${PORT}`);
    });
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
    
    // Keep process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => process.exit(0));
    });
    
    // Explicitly prevent process from exiting
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      process.exit(1);
    });
    
    process.on('exit', (code) => {
      console.log(`Process is exiting with code ${code}`);
    });
    
    console.log('Server initialization complete. Press Ctrl+C to stop.');
  } catch (err) {
    console.error('Failed to start server', err);
    console.error(err.stack);
    process.exit(1);
  }
}

start();
