const http = require('http');

// Test the fields-config endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/fields-config',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing API endpoint: http://localhost:3000/api/fields-config');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.end();
