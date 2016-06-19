const electron = require('electron');
const {
  app,
  BrowserWindow
} = electron;
const ipcMain = require('electron').ipcMain
const plugin = require('./plugins')
const config = require('./config')

let mainWindow;

function init() {
  const shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()

  app.on('ready', () => {
    createMainWindow()
    registShotcut()
  });
  // Quit when all mainWindows are closed.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darmainWin') {
      app.quit();
    }
  });
  app.on('activate', () => {
    if (mainWindow === null) {
      createMainWindow();
    }
  });
  ipcMain.on('exec', (event, args) => {
    plugin.exec(args, event)
  })
  ipcMain.on('exec-item', (event, args) => {
    console.log(args);
    plugin.execItem(args.cmd, args.item, event)
  })
  ipcMain.on('window-resize', (event, args) => {
    console.log(args);
    let height = args.height || mainWindow.getContentSize()['height'];
    let width = args.width || mainWindow.getContentSize()['width'];
    if (!config.debug) {
      mainWindow.setContentSize(width, height, true);
    }
  })
  ipcMain.on('hide', () => {
    mainWindow.hide()
  })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: config.debug ? 800 : config.width,
    height: 400,
    resizable: config.debug ? true : false,
    title: config.title,
    type: config.debug ? 'normal' : 'splash',
    titleBarStyle: 'hidden',
    autoHideMenuBar: config.debug ? false : true,
    backgroundColor: 'alpha(opacity=0)',
    show: !process.argv.some((arg) => arg === '--hide'),
    transparent: true,
    alwaysOnTop: true,
    disableAutoHideCursor: true
  });

  if (!config.debug) {
    mainWindow.setContentSize(config.width, config.height, true);
  }

  mainWindow.loadURL(`file://${__dirname}/browser/search/index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('blur',()=>{
    mainWindow.hide()
  })
}

function registShotcut() {
  let shotcut = config.shotcut && config.shotcut[process.platform] || config.shotcut.default
  shotcut = shotcut || 'Super+Space'
  const ret = electron.globalShortcut.register(shotcut, () => {
    if(mainWindow.isVisible()){
      mainWindow.hide()
    }else{
      mainWindow.restore();
      mainWindow.show()
      mainWindow.focus();
    }
  });

  if (!ret) {
    console.log('registration failed');
  }

}

function makeSingleInstance() {
  return app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

init()
