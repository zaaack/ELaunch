# plugin

Plugin for ELaunch is a simple npm package, but exports an object with specific methods below

## setConfig()
### setConfig(pluginConfig, globalConfig)
This method would called everytime you triggered this plugin by command.
* pluginConfig is the config merged command config and plugin config in config file
* globalConfig is the config file plus some useful tool:
```js
globalConfig = {
  dataPath: '~/.ELaunch',
  userConfigFile: '~/.ELaunch/config.js',
  merge(obj1,obj2,obj3...){
    //(func) deeply merge properties in objects, notice it won't merge array
  },
  debug:, //(bool) whether it's running in debug mode
  context: { //(object)
    mainWindow: mainWindow, //the BrowserWindow contains the input box
    notifier: {//notifier is a wrapper for notification runs in both main process and renderer process, it has only one method is `notify(title, options)`, please see [html5 notification](http://devdocs.io/dom/notification)
      notify(title, opts){

      }
    }
  }
}
```

## exec()
### exec(args, event, cmdInfo)

* args(array): the command args array that not including command key
* event: event.sender.send() , please see [electron docs](http://electron.atom.io/docs/api/ipc-main/#sending-messages)
* cmdInfo(object): raw object of command
```js
{
  key: key,
  script: path.resolve(config.dataPath, plugin.script),
  args: args,
  config: plugin.config || {}
}
```

### return
```js
let items =[{
  name: 'HAHA',
  icon: `${__dirname}/assets/shell.png`,
  value: args.join(' '),// for item.value in execItem, mostly is `args.join(' ')`
  detail: '',
  opts: [{name: 'exec',label: 'Exec'}],//option buttons for item.opt , the first is default
  custom_view: ''// custom html to show in the item list
}]
event.sender.send('exec-reply', items)
```

## execItem()
### execItem(item, event)

* item(object):
```js
item = {
    value: '',//the value of item
    opt: ''//the name of option in item, this could be undefined if no opts in reply of exec method
}
```
* event: like event in exec

### return
```js
event.sender.send('exec-item-reply')//this would cause the mainWindow to hide
```

## Demos
 You can see demos in [core plugins](../plugins)
