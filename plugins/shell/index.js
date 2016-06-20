let child = require('child_process')
let pluginConfig, shellProcess

function endExecItem(event){
  event.sender.send('exec-item-reply')
}

module.exports = {
  setConfig: function (pConfig, globalConfig) {
    pluginConfig = pConfig
  },
  exec: function (args, event, cmdInfo) {
    args = args.join(' ')
    let engine = pluginConfig.engine ? pluginConfig.engine : cmdInfo.key
    event.sender.send('exec-reply', [{
      name: cmdInfo.key + ' ' + args,
      icon: `${__dirname}/assets/shell.png`,
      value: args,
      detail: '',
      opts: [{name: 'exec',label: 'Exec'}]
    }])
  },
  execItem: function (item, event) {
    switch (item.opt) {
    case 'close':
      endExecItem(event)
      break;
    case 'kill':
      shellProcess && shellProcess.kill()
      break;
    case 'copy':
      require('electron').clipboard.writeText(item.value);
      endExecItem(event)
      break;
    case 'exec':
      console.log('end');
      shellProcess && shellProcess.kill()
      shellProcess = child.exec(item.value, (err, stdout, stderr) => {
        let hasError = err || stderr, out,
          opts = [{name: 'close', label: 'Close'},
            { name: 'copy', label: 'Copy'}]
        if (err) {
          out = err.message + '\n' + err.stack
        } else {
          out = stderr || stdout
        }
        console.log('child');
        event.sender.send('exec-reply', [{
          value: out,
          custom_view: `
            <pre style="color: ${hasError?'red':'black'}">${out}</pre>
            <div class="btn-group">
              ${opts.map((opt,optIndex)=>
                `<button class="btn btn-dom color-${optIndex} ${optIndex===0?  `select`:``}" data-name="${opt.name}">${opt.label}</button>`
              ).join('')}
            </div>`
        }])
      })
      event.sender.send('exec-reply', [{
        name: 'Command is Running',
        detail: 'Please wait...',
        icon: `${__dirname}/assets/shell.png`,
        opts: [{name:'kill', label: 'Kill'}]
      }])
    }
  }
}
