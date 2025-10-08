import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Mock fields config route
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
    message: 'Mock field configurations retrieved successfully'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/test`);
  console.log(`Fields Config URL: http://localhost:${PORT}/api/fields-config`);
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default app;
