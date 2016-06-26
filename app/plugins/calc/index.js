let electron = require('electron')
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
      with(Math){result = eval(args)+''}
    } catch (e) {}
    event.sender.send('exec-reply', [{
      name: args+' = '+result,
      icon: pluginConfig.icon || `${__dirname}/assets/calc.png`,
      value: {
        result: result,
        equation: args+'='+result
      },
      detail: '',
      opts: [{name:'copy-result',label:'Copy'},{name:'copy-equation',label:'Copy Equation'}]
    }])
  },
  execItem: function (item, event) {
    console.log(item);
    switch (item.opt) {
      case 'copy-result':
        electron.clipboard.writeText(item.value.result)
        break;
      case 'copy-equation':
        electron.clipboard.writeText(item.value.equation)
        break;
      default:
    }
    event.sender.send('exec-item-reply')
  }
}
