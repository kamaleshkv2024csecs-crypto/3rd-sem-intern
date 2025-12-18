const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/signup', (req, res) => {
  res.status(503).json({ error: 'Database unavailable' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
console.log(`Starting server on port ${PORT}...`);

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close();
});
