const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let serverProcess;
let mongoProcess;
const isDev = process.env.NODE_ENV === 'development';

// Paths configuration
const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'app')
  : path.join(__dirname, '..');

const SERVER_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'server')
  : path.join(__dirname, '../../server');

const MONGO_DATA_PATH = path.join(app.getPath('userData'), 'mongodb-data');
const UPLOADS_PATH = path.join(app.getPath('userData'), 'uploads');

// Ensure required directories exist
function ensureDirectories() {
  [MONGO_DATA_PATH, UPLOADS_PATH].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Start embedded MongoDB
function startMongoDB() {
  return new Promise((resolve, reject) => {
    console.log('Starting embedded MongoDB...');
    
    // Use mongodb-memory-server for embedded MongoDB
    const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
    
    MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: MONGO_DATA_PATH,
        storageEngine: 'wiredTiger',
      },
      binary: {
        version: '6.0.0',
      },
    }).then(mongoServer => {
      mongoProcess = mongoServer;
      const mongoUri = mongoServer.getUri();
      console.log('MongoDB started at:', mongoUri);
      resolve(mongoUri);
    }).catch(err => {
      console.error('Failed to start MongoDB:', err);
      reject(err);
    });
  });
}

// Start Express server
function startServer(mongoUri) {
  return new Promise((resolve, reject) => {
    console.log('Starting Express server...');
    
    const serverScript = app.isPackaged
      ? path.join(SERVER_PATH, 'index.js')
      : path.join(SERVER_PATH, 'dist', 'index.js');

    // Set environment variables
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3000',
      MONGO_URI: mongoUri,
      UPLOAD_DIR: UPLOADS_PATH,
      JWT_SECRET: 'raghav-billing-shipment-management-secret-key-2025',
      CORS_ORIGIN: 'http://localhost:3000',
    };

    // Start server process
    serverProcess = spawn('node', [serverScript], {
      env,
      cwd: SERVER_PATH,
      stdio: 'inherit',
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Wait for server to be ready
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkServer = () => {
      http.get('http://localhost:3000/health', (res) => {
        if (res.statusCode === 200) {
          console.log('Server is ready!');
          resolve();
        } else {
          retryCheck();
        }
      }).on('error', () => {
        retryCheck();
      });
    };

    const retryCheck = () => {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkServer, 1000);
      } else {
        reject(new Error('Server failed to start within timeout'));
      }
    };

    setTimeout(checkServer, 2000);
  });
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    backgroundColor: '#ffffff',
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize app
async function initializeApp() {
  try {
    console.log('Initializing Shipment Management System...');
    
    // Ensure directories exist
    ensureDirectories();
    
    // Start MongoDB
    const mongoUri = await startMongoDB();
    
    // Start Express server
    await startServer(mongoUri);
    
    // Create window
    createWindow();
    
    console.log('Application initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
}

// App lifecycle
app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Cleanup on quit
app.on('before-quit', async () => {
  console.log('Shutting down...');
  
  // Stop server
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // Stop MongoDB
  if (mongoProcess) {
    await mongoProcess.stop();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

