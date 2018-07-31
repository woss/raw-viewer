try {
  require('./tools/electron-watcher.js');
  require('electron-debug')({
    showDevTools: false,
    devToolsMode: 'right'
  });
} catch (err) {}

const path = require('path');
const url = require('url');

const config = require('./tools/config.js');

const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

function createWindow () {
  config.read().then(function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: config.getProp('window.width') || 800,
      height: config.getProp('window.height') || 600
    });

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'public', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    mainWindow.on('closed', function () {
      mainWindow = null;
    });

    mainWindow.on('resize', function () {
      var size = mainWindow.getSize();

      config.setProp('window.width', size[0]);
      config.setProp('window.height', size[1]);
    });

    if (config.getProp('devToolsOpen')) {
      mainWindow.webContents.openDevTools();
    }
  }).catch(function (err) {
    throw err;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
