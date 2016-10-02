let child = require('child_process')
let pluginConfig, shellProcess

function endExecItem(event){
  event.sender.send('exec-item-reply')
}

module.exports = {
  setConfig: function (pConfig, globalConfig) {
    pluginConfig = pConfig
    if(pluginConfig.terminal === 'platform'){
      switch (process.platform) {
        case 'linux':
          pluginConfig.terminal = "gnome-terminal -x $SHELL -c \"%s;exec $SHELL\""
          break;
        case 'darwin':
          pluginConfig.terminal = `osascript
            -e "tell application \\"Terminal\\""
            -e "activate"
            -e "do script \\"%s\\""
            -e "end tell"`.replace(/\n/g, '')
          break
        case 'win32':
          pluginConfig.terminal = 'cmd.exe /k "%s"'
          break
        default:

      }
    }
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
    default:
      pluginConfig.terminal = pluginConfig.terminal || 'node'
      if(pluginConfig.terminal !== 'node'){
        shellProcess && shellProcess.kill()
        shellProcess = child.exec(
          pluginConfig.terminal.replace(/\n/g,' ').replace('%s', item.value.replace(/\"/g,"'")), {
            cwd: pluginConfig.cwd || require('os').homedir()
          }, (err)=>err && console.error(err))
        endExecItem(event)
        return
      }

      shellProcess && shellProcess.kill()
      shellProcess = child.exec(item.value, {
        maxBuffer: 5*1024*1024,
        cwd: pluginConfig.cwd || require('os').homedir()
      },(err, stdout, stderr) => {
        let hasError = err || stderr, out,
          opts = [{name: 'close', label: 'Close'},
            { name: 'copy', label: 'Copy'}]
        if (err) {
          out = err.message + '\n' + err.stack
        } else {
          out = stderr || stderr.trim() || stdout || 'Success!'
        }
        console.log('child',out, err,stdout);
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
