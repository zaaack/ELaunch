const electron = require('electron')
const config = require('../config')


module.exports = {
  setPosition(win, pos) {
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
    } else if (pos && pos.width && pos.height) {
      x = bx + (dw - pos.width) / 2
      y = by + (dh - pos.height) / 2
    }

    x = Math.round(x)
    y = Math.round(y)

    win.setPosition(x, y)
  },
}
