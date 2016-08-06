const electron = require('electron');
const {
  app,
  Tray,
  Menu,
  BrowserWindow
} = electron;
const ipcMain = require('electron').ipcMain
const plugin = require('./plugins')
const config = require('./config')

let mainWindow;

function init() {
  const shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()
  app.dock && app.dock.hide()
  app.on('ready', () => {
    createMainWindow()
    registShotcut()
    initTray()
    initMenu()
  });
  // Quit when all windows are closed.
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
  ipcMain.on('exec', (event, data) => {
    plugin.exec(data, event)
  })
  ipcMain.on('exec-item', (event, data) => {
    plugin.execItem(data, event)
  })
  ipcMain.on('window-resize', (event, data) => {
    let height = data.height || mainWindow.getContentSize()['height']
    let width = data.width || config.width
    height = Math.min(height, config.max_height)
    if (!config.debug) {
      mainWindow.setContentSize(width, height, true);
    }
  })
  ipcMain.on('hide', () => {
    hideMainWindow()
  })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.max_height,
    resizable: config.debug ? true : false,
    title: config.title,
    type: config.debug ? 'normal' : 'splash',
    frame: false,
    skipTaskbar: config.debug ? false : true,
    autoHideMenuBar: config.debug ? false : true,
    backgroundColor: 'alpha(opacity=0)',
    show: false,
    transparent: true,
    alwaysOnTop: true,
    disableAutoHideCursor: true,
  })

  if (!config.debug) {
    mainWindow.setContentSize(config.width, config.height, true);
  }

  initPosition(mainWindow)

  mainWindow.loadURL(`file://${__dirname}/browser/search/index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('blur', () => {
    hideMainWindow()
  })

  config.context.mainWindow = mainWindow
}

function initPosition(mainWindow) {
  let display = electron.screen.getPrimaryDisplay()
  if (config.display && Number.isInteger(config.display)) {
    display = electron.screen.getAllDisplays()
      .find((d) => d.id === config.display)
  }

  const bx = display.bounds.x,
    by = display.bounds.y
  let x = bx + (display.workAreaSize.width - config.width) / 2
  let y = by + (display.workAreaSize.height - config.max_height) / 2

  if (config.position &&
    config.position.x !== void 0 &&
    config.position.y !== void 0) {
    x = bx + config.position.x
    y = bx + config.position.y
  }
  mainWindow.setPosition(x, y)
}

function hideMainWindow() {
  if (config.debug) return
  mainWindow.hide()
  app.hide && app.hide() // auto focus on last focused window is default feature in window/linux, we can use app.hide() in osx to implement it
}

function toggleMainWindow() {
  if (mainWindow.isVisible()) {
    hideMainWindow()
  } else {
    mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    app.show && app.show()
  }
}

function registShotcut() {
  let toggleShortcut = config.shotcut.toggle
  toggleShortcut = toggleShortcut[process.platform] || toggleShortcut.default || 'Super+Space'
  const ret = electron.globalShortcut.register(toggleShortcut, toggleMainWindow);
  if (!ret) {
    console.log('registration failed');
  }
}

let tray = null

function initTray() {
  tray = new Tray(__dirname + '/icon_16x16@2x.png')
  const contextMenu = Menu.buildFromTemplate([{
    label: 'Toggle ELaunch',
    click(item, focusedWindow) {
      toggleMainWindow()
    }
  }, {
    label: 'Preferences',
    click(item, focusedWindow) {
      require('electron').shell.openItem(require('os').homedir() + '/.ELaunch/config.js')
    }
  }, {
    label: 'Bug Report',
    click(item, focusedWindow) {
      electron.shell.openExternal('https://github.com/zaaack/ELaunch/issues')
    }
  }, {
    label: 'Help',
    click(item, focusedWindow) {
      electron.shell.openExternal('https://github.com/zaaack/ELaunch#readme')
    }
  }, {
    label: 'Reload Config',
    click(item, focusedWindow) {
      config.loadConfig().emitReload()
    }
  }, {
    label: 'Exit',
    click(item, focusedWindow) {
      app.quit()
    }
  }]);
  tray.setToolTip('ELaunch is running.')
  tray.setContextMenu(contextMenu)
}

function initMenu() { //init menu to fix copy/paste shortcut issue
  if (process.platform !== 'darwin' || Menu.getApplicationMenu()) return
  var template = [{
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }, ]
  }]
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

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
