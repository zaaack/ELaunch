const electron = require('electron')

let config

const winMgr = {
  init(cfg) {
    config = cfg
    return winMgr
  },
  setPosition(win, pos) {
    let display = electron.screen.getPrimaryDisplay()
    if (config.display && Number.isInteger(config.display)) {
      display = electron.screen.getAllDisplays()
        .find((d) => d.id === config.display) || display
    }

    const bx = display.bounds.x
    const by = display.bounds.y
    const dw = display.workAreaSize.width
    const dh = display.workAreaSize.height
    const wb = win.getBounds()
    // set window to center in primary display when default
    let x = bx + (dw - wb.width) / 2
    let y = by + (dh - wb.height) / 2

    const isCustom = pos && Number.isInteger(pos.x)
      && Number.isInteger(pos.y)
    if (isCustom) {
      x = bx + pos.x
      y = bx + pos.y
    } else if (pos && pos.width && pos.height) {
      x = bx + (dw - pos.width) / 2
      y = by + (dh - pos.height) / 2
    }

    x = Math.round(x)
    y = Math.round(y)

    win.setPosition(x, y)
  },
  setContentSize(win, width, height, animateOnMac = true) {
    const sizes = win.getContentSize()
    win.setContentSize(width || sizes[0], height || sizes[1], animateOnMac)
  },
  hideMainWindow() {
    const { mainWindow, app } = config.context
    mainWindow.hide()
    // auto focus on last focused window is default feature in window/linux,
    // we can use app.hide() in osx to implement it
    if (app.hide) app.hide()
  },
  showMainWindow() {
    const { mainWindow, app } = config.context
    mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    if (app.show) app.show()
  },
  toggleMainWindow() {
    const { mainWindow } = config.context
    if (mainWindow.isVisible()) {
      winMgr.hideMainWindow()
    } else {
      winMgr.showMainWindow()
    }
  },
}

module.exports = winMgr
