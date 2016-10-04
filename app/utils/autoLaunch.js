const AutoLaunch = require('auto-launch')

module.exports = (enable = true) => {
  require('pkginfo')(module)
  const pkg = module.exports

  const launch = new AutoLaunch({
    name: pkg.name,
    mac: {
      useLaunchAgent: true,
    },
  })
  launch.isEnabled()
    .then((isEnabled) => {
      if (!isEnabled && enable) {
        launch.enable()
      } else if (isEnabled && !enable) {
        launch.disable()
      }
    })
    .catch(e => console.error(e))
}
