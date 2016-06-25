let shell = require('electron').shell
let pluginConfig

module.exports = {
  setConfig: function (pConfig, globalConfig) {
    pluginConfig = pConfig
  },
  exec: function (args, event, cmdInfo) {
    args = args.join(' ')
    if(!args.trim()) return
    let result = ''
    try {
      with(Math){result = eval(args)}
    } catch (e) {}
    event.sender.send('exec-reply', [{
      name: args+' = '+result,
      icon: pluginConfig.icon || `${__dirname}/assets/calc.png`,
      value: args,
      detail: ''
    }])
  },
  execItem: function (item, event) {
    let urlPatt = pluginConfig.url || 'https://www.bing.com/search/?q=%s'
    shell.openItem(urlPatt.replace('%s', item.value))
    event.sender.send('exec-item-reply')
  }
}
