const electron = require('electron')
const i18n = require('../i18n')
const config = require('../config')
const winMgr = require('../main/winMgr').init(config)
const t = { i18n }
const dialog = (electron || electron.remote).dialog

const globalCommands = {
  toggle: {
    defaultShortcut: 'Super+Space',
    func: winMgr.toggleMainWindow.bind(winMgr),
  },
}

const shortCutMgr = {
  registerAll() {
    const { shortcuts } = config
    Object.keys(globalCommands)
      .forEach(cmd => {
        const { func, defaultShortcut } = globalCommands[cmd]
        const shortcut = shortcuts[cmd][process.platform]
          || shortcuts[cmd].default
          || defaultShortcut
        if (!shortcut) return
        const ret = electron.globalShortcut.register(shortcut, func)
        if (!ret) {
          dialog.showErrorBox(
            t('Error'), `${t('Shortcut regist error')}
            shortcut: ${shortcut}
            command: ${cmd}
            `)
        }
      })
  },
  unregisterAll() {
    electron.globalShortcut.unregisterAll()
  },
}

electron.ipcMain.on('main/shortcutMgr', (event, data) => {
  shortCutMgr[data]()
})

module.exports = shortCutMgr
