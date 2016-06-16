var fs = require('fs')
var path = require('path')
var fsUtils = require('nodejs-fs-utils')
var shell = require('electron').shell;

let appPaths = ['/usr/share/applications','/home/z/.local/share/applications']
let iconPaths = ['/usr/share/icons/hicolor','/home/z/.local/share/icons/hicolor']
let apps = []
let lastUpdateTime = 0


module.exports = {
  update: function () {
    if(Date.now()-lastUpdateTime>3000){
      lastUpdateTime = Date.now()
    }
    apps=[]
    appPaths.forEach((dir,dirI)=>{
      if(!fs.existsSync(dir)) return
      let icons=[]
      let defaultIcon = __dirname+'/assets/app.png'
      if(fs.existsSync(iconPaths[dirI])){
        fs.readdirSync(iconPaths[dirI]).sort((a,b)=>{
          let ma = a.match(/(\d+)x\d+/)
          let mb = b.match(/(\d+)x\d+/)
          if(ma && mb){
            return +ma[1]-mb[1]
          }
          return 1
        }).filter(a=>a.match(/\d+x\d+/)).forEach(dir=>fsUtils.walkSync(iconPaths[dirI]+'/'+dir, (err, file, stats, next, cache)=>{
          if(err){
            console.log(err); return
          }
          if(typeof file === 'string'){
            if(file.indexOf('.png')>-1){
              icons.push(file)
            }
            next()
          }
        }))
      }
      icons = icons.reverse()
      apps = apps.concat(fs.readdirSync(dir)
        .filter((name)=>name.indexOf('.desktop')>-1)
        .map(name=>{
          let file=dir+'/'+name
          let icon,execCmd
          name = path.basename(name, '.desktop')
          try {
            let content = fs.readFileSync(file,'utf-8')
            name = content.match(/Name=(.*)(\n|$)/)[1]
            execCmd = content.match(/Exec=(.*)(\n|$)/)[1]
            let appIcon = content.match(/Icon=(.*)(\n|$)/)[1]
            icon = icons.find(icon=>icon.indexOf(appIcon+'.png')>=0)
          } catch (e) { }
          return {
            name: name,
            detail: file,
            icon: icon || defaultIcon,
            value: execCmd
          }
        }))
    })
  },
  exec: function (args, cb) {
    this.update()
    if(args.join('').trim()==='') return cb([]) //空格返回空
    let re=new RegExp(args.join('').toLocaleLowerCase().split('').join('.*'))
    cb && cb(apps.filter(app=>{
      return re.test(app.name.toLocaleLowerCase())
    }))
  },
  execItem: function (item, cb) {
    require('child_process').exec(item)
    cb()
  }
}
