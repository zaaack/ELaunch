const ui = require('./ui')
const event2String = require('key-event-to-string')

const readKey = event2String(({ joinWith: '+' }))

const searchCommands = {
  selectPrevItem: {
    defaultShortcut: 'Up',
    func() {
      ui.selectPrevItem()
      ui.resizeWindow()
    },
  },
  selectNextItem: {
    defaultShortcut: 'Down',
    func() {
      ui.selectNextItem()
      ui.resizeWindow()
    },
  },
  selectPrevItemOpt: {
    defaultShortcut: 'Left',
    func() {
      ui.selectPrevItemOpt()
    },
  },
  selectNextItemOpt: {
    defaultShortcut: 'Right',
    func() {
      ui.selectNextItemOpt()
    },
  },
}

module.exports = {
  handleKeyDown(e, ...args) {
    const keyStr = readKey(e)
    const config = require('../../../config')
    const shortcuts = config.shortcuts
    let handled = false
    Object.keys(searchCommands).forEach(cmd => {
      const { defaultShortcut, func } = searchCommands[cmd]
      const shortcut = shortcuts[cmd][process.platform]
        || shortcuts[cmd].default
        || defaultShortcut
      if (shortcut === keyStr) {
        func(...args)
        handled = true
      }
    })
    return handled
  },
}
