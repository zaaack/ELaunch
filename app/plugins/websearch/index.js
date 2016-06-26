let shell = require('electron').shell
var querystring = require('querystring');
let pluginConfig

module.exports = {
  setConfig: function (pConfig, globalConfig) {
    pluginConfig = pConfig
  },
  exec: function (args, event, cmdInfo) {
    args = args.join(' ')
    let engine = pluginConfig.engine?pluginConfig.engine:cmdInfo.key
    event.sender.send('exec-reply', [{
      name: engine+' '+args,
      icon: pluginConfig.icon || `${__dirname}/assets/search.svg`,
      value: args,
      detail: ''
    }])
  },
  execItem: function (item, event) {
    let urlPatt = pluginConfig.url || 'https://www.bing.com/search/?q=%s'
    shell.openExternal(urlPatt.replace('%s', querystring.escape(item.value)))
    event.sender.send('exec-item-reply')
  }
}
