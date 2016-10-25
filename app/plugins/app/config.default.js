const home = require('os').homedir()

module.exports = {
  config: {
    darwin: {
      appPaths: ['/Applications', `${home}/Applications`],
    },
    linux: {
      appPaths: ['/usr/share/applications',
        '/usr/local/share/applications',
        `${home}/.local/share/applications`],
      iconPaths: ['/usr/share/icons',
        `${home}/.local/share/icons`,
        '/usr/share/pixmaps'],
    },
    win32: {
    },
  },
  commands: {
    app: {},
  },
}
