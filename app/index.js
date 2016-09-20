const electron = require('electron')
const { app, Tray, Menu, BrowserWindow } = electron
const ipcMain = require('electron').ipcMain
const plugin = require('./plugins')
const config = require('./config')

let mainWindow, prefWindow;


function setPosition(win, pos) {
  let display = electron.screen.getPrimaryDisplay()
  if (config.display && Number.isInteger(config.display)) {
    display = electron.screen.getAllDisplays()
      .find((d) => d.id === config.display)
  }

  const bx = display.bounds.x
  const by = display.bounds.y
  const dw = display.workAreaSize.width
  const dh = display.workAreaSize.height
  const wb = win.getBounds()
  // set window to center in primary display when default
  let x = bx + (dw - wb.width) / 2
  let y = by + (dh - wb.height) / 2

  if (pos && pos.x && pos.y) {
    x = bx + pos.x
    y = bx + pos.y
  } else if (pos && pos.width && pos.height){
    x = bx + (dw - pos.width) / 2
    y = by + (dh - pos.height) / 2
  }

  x = Math.round(x)
  y = Math.round(y)

  win.setPosition(x, y)
}

function hideMainWindow() {
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

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.max_height,
    resizable: config.debug,
    title: config.title,
    type: config.debug ? 'normal' : 'splash',
    frame: config.debug,
    skipTaskbar: !config.debug,
    autoHideMenuBar: !config.debug,
    backgroundColor: 'alpha(opacity=0)',
    show: config.debug,
    transparent: true,
    alwaysOnTop: !config.debug,
    disableAutoHideCursor: true,
  })

  if (!config.debug) {
    mainWindow.setContentSize(config.width, config.height, true);
  }

  setPosition(mainWindow, {
    x: config.position && config.position.x,
    y: config.position && config.position.y,
    width: config.width,
    height: config.max_height
  })

  mainWindow.loadURL(`file://${__dirname}/browser/search/index.html`)
  mainWindow.on('closed', () => {
    mainWindow = null
  });

  mainWindow.on('blur', () => {
    if (!config.debug) {
      hideMainWindow()
    }
  })

  config.context.mainWindow = mainWindow
}

function createPrefWindow() {
  prefWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'ELaunch Preferences',
      autoHideMenuBar: !config.debug,
      backgroundColor: 'alpha(opacity=0)',
  })
  prefWindow.loadURL(`http://127.0.0.1:8080/`);
  setPosition(prefWindow)
}

function registShortcut() {
  let toggleShortcut = config.shortcut.toggle
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
      if (config.debug) {
        createPrefWindow()
      } else {
        electron.shell.openItem(require('os').homedir() + '/.ELaunch/config.js')
      }
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



function init() {
  const shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()
  if (!config.debug) {
    app.dock && app.dock.hide()
  }
  app.on('ready', () => {
    createMainWindow()
    registShortcut()
    initTray()
    initMenu()

    if (config.debug) {
      createPrefWindow()
    }

    config.context.app = app
    config.context.locale = app.getLocale()
    config.emit('app-ready')
  });
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
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


init()
