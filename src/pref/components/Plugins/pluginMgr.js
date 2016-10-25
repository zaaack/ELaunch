import config from '../../../../app/config'


export function installPlugin(name) {
  config.emit('install-plugin', name)
  return new Promise((resolve, reject) => {
    config.on(`install-plugin-success:${name}`, resolve)
    config.on(`install-plugin-error:${name}`, reject)
  })
}

export function uninstallPlugin(name) {
  config.emit('uninstall-plugin', name)
  return new Promise((resolve, reject) => {
    config.on(`uninstall-plugin-success:${name}`, resolve)
    config.on(`uninstall-plugin-error:${name}`, reject)
  })
}
