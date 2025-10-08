const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Starting server...');

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Mock fields config route
app.get('/api/fields-config', (req, res) => {
  console.log('Fields config endpoint called');
  res.json({
    success: true,
    data: [
      {
        key: 'customerName',
        label: 'Customer Name',
        type: 'text',
        required: true,
        visible: true,
        order: 1
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: false,
        visible: true,
        order: 2
      }
    ],
    message: 'Mock field configurations retrieved successfully'
  });
});

// Start server
console.log('About to start listening...');
const server = app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/test`);
  console.log(`Fields Config URL: http://localhost:${PORT}/api/fields-config`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Server setup complete');
