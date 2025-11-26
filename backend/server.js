require('dotenv').config();
const express = require('express');
const cors = require('cors');
const locationRoutes = require('./routes/locationRoutes');
const phraseRoutes = require('./routes/phraseRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'VESNS API is running' });
});

// Routes
app.use('/locations', locationRoutes);
app.use('/phrases', phraseRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    data: null,
    message: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    data: null,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VESNS Backend server running on http://localhost:${PORT}`);
});

