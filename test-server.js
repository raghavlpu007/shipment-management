const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is working!',
    timestamp: new Date().toISOString()
  });
});

// Fields config test route
app.get('/api/fields-config', (req, res) => {
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
    message: 'Test field configurations retrieved successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/test`);
  console.log(`Fields Config URL: http://localhost:${PORT}/api/fields-config`);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});
