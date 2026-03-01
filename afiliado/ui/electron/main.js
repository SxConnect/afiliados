const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let coreProcess;

function startCoreEngine() {
    const corePath = path.join(__dirname, '../../core/afiliado-core.exe');

    coreProcess = spawn(corePath);

    coreProcess.stdout.on('data', (data) => {
        console.log(`Core: ${data}`);
    });

    coreProcess.stderr.on('data', (data) => {
        console.error(`Core Error: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    startCoreEngine();
    setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
    if (coreProcess) {
        coreProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
