let path = require('path')
let fs = require('fs-extra')
let child = require('child_process')
let config = require('../../../config')
let os = require('os')
let pluginConfig = {
  include_path: ["/"],
  excludePaths: [],
  limit: 20
}, fp
module.exports = {
    setConfig: function (pConfig) {
      config.merge(pluginConfig, pConfig)
      let rep = p => path.normalize(p.replace(/^~/, os.homedir()))
      pluginConfig.rootDir = rep(pluginConfig.rootDir) || os.homedir()
    },
    exec: function (args, event) {
      if (args.join('').trim() === '') return  //空格返回空
      let patt = args.join('')
      let cmdArgs = ['-onlyin',`${pluginConfig.rootDir}`,`"${patt}"`]
      console.log(cmdArgs);
      let defaultIcon = __dirname+'/../assets/file.svg'
      fp && fp.kill()
      fp = child.spawn('mdfind',cmdArgs)
      let out = ''
      fp.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        out += data.toString('utf-8')
        let items =  out.trim().split('\n');
        if(items.length>=pluginConfig.limit) fp.kill()
        items = items.slice(0, pluginConfig.limit)
            .filter(file=>!/^\s*$/.test(file)).map(file=>{
              return {
                name: path.basename(file),
                detail: file,
                icon: defaultIcon,
                value: file,
                opts: [
                  {name:'open',label:'Open'}, //first is default
                  {name:'open-folder',label:'Open Folder'},
                  {name:'copy-path',label:'Copy Path'}
                ]
              }
            })
        console.log(items);
        event.sender.send('exec-reply', items)
      });

      fp.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });
      fp.on('error', (err) => {
        console.log('Failed to start child process.',err);
      });
      fp.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
  },
  execItem: function (item,  event) {
    switch (item.opt) {
      case 'copy-path':
      require('electron').clipboard.writeText(item.value);
        break
      case 'open-folder':
        require('electron').shell.openItem(path.dirname(item.value))
        break
      case 'open':
      default:
      require('electron').shell.openItem(item.value)
    }

    event.sender.send('exec-item-reply')
  }
}
