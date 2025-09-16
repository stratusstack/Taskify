const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;

const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = 3001;
const FRONTEND_URL = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, 'build/frontend/index.html')}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(FRONTEND_URL);
  } else {
    startBackendServer().then(() => {
      setTimeout(() => {
        mainWindow.loadURL(`http://localhost:${BACKEND_PORT}`);
      }, 2000);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackendServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      resolve();
      return;
    }

    const backendPath = path.join(__dirname, 'build/backend');
    const serverScript = path.join(backendPath, 'server.js');

    if (!fs.existsSync(serverScript)) {
      dialog.showErrorBox('Backend Error', 'Backend server files not found. Please rebuild the application.');
      app.quit();
      return;
    }

    const userData = app.getPath('userData');
    const dbPath = path.join(userData, 'taskify.sqlite');

    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: BACKEND_PORT.toString(),
      DB_TYPE: 'sqlite',
      SQLITE_DB: dbPath,
      JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      FRONTEND_URL: `http://localhost:${BACKEND_PORT}`
    };

    backendProcess = spawn('node', [serverScript], {
      cwd: backendPath,
      env: env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
      if (data.toString().includes('Server running')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      dialog.showErrorBox('Backend Error', `Failed to start backend server: ${error.message}`);
      reject(error);
    });

    backendProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Backend process exited with code ${code}`);
      }
    });

    setTimeout(() => {
      resolve();
    }, 3000);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

process.on('SIGTERM', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});

process.on('SIGINT', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});