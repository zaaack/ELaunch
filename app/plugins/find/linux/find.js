let path = require('path')
let fs = require('fs-extra')
let child = require('child_process')
let config = require('../../../config')
let os = require('os')
let pluginConfig = {
  limit: 20
}, findProcess
module.exports = {
    setConfig: function (pConfig) {
      config.merge(pluginConfig, pConfig)
      let rep = p => fs.realpathSync(p.replace('~/', os.homedir() + '/'))
      pluginConfig.include_path = pluginConfig.include_path.map(rep) || os.homedir()
    },
    exec: function (args, event) {
      if (args.join('').trim() === '') return  //空格返回空
      let patt = args.join('').toLocaleLowerCase()
      if(patt.indexOf('*')<0){
        patt = patt.replace(/(.)/g,'*$1*')
      }
      let includePara = pluginConfig.include_path.map(ip=>`"${ip}"`).join(' '),
          excludePara = pluginConfig.exclude_path.map(ep=>`-path "${ep}"`).join(' -o ')
      //find "/Users/z" \( -path "**/.*" -o -path "**/node_*" \)  -a -prune -o \( -type d -o -type f \) -name "*a*" -print | grep "." -m 20
      let cmd = `find ${includePara} ` +
      (excludePara?`\\( ${excludePara} \\)  -a -prune `:``) +
      `-o \\( -type d -o -type f \\) ` +
      (pluginConfig.maxdepth?`-maxdepth ${pluginConfig.maxdepth}`:``) +
      `-name "${patt}" -print | grep "." -m ${pluginConfig.limit}`
      console.log(cmd);
      let defaultIcon = __dirname+'/../assets/file.svg'
      findProcess && findProcess.kill()
      console.time('find');
      findProcess = child.execFile('sh',['-c',cmd], (error, stdout, stderr)=>{// don't use node to parse pipe is  more effective
        if(error){
          console.error(error)
          event.sender.send('exec-reply', [])
          return
        }
        stdout = stdout+''
        console.timeEnd('find');
        let items =  stdout.split('\n').slice(0, pluginConfig.limit)
            .filter(file=>!/^\s*$/.test(file)).map(file=>{
              return {
                name: path.basename(file),
                detail: file,
                icon: defaultIcon,
                value: file,
                opts: [
                  {name:'open',label:'Open'}, //first is default
                  {name:'copy-path',label:'Copy Path'}
                ]
              }
            })
        // console.log(items);
        event.sender.send('exec-reply', items)
      })
  },
  execItem: function (item,  event) {
    switch (item.opt) {
      case 'copy-path':
      require('electron').clipboard.writeText(item.value);
        break
      case 'open':
      default:
      require('electron').shell.openItem(item.value)
    }

    event.sender.send('exec-item-reply')
  }
}
