# plugin

Plugin for ELaunch is a simple npm package, but exports a object with specific methods

## setConfig()
### setConfig(pluginConfig, globalConfig)
This method would called everytime you triggered this plugin by command.
* pluginConfig is the config merged command config and plugin config in config file
* globalConfig is the config file plus some useful tool:
  * globalConfig.dataPath: '~/.ELaunch'
  * globalConfig.userConfigFile: '~/.ELaunch/config.js'
  * globalConfig.merge(obj1,obj2,obj3...): deeply merge properties in objects, notice it won't merge array
  * globalConfig.debug: whether it's running in debug mode
  * globalConfig.context: now it only has two objects mainWindow and notifier
    * context.mainWindow is the BrowserWindow of the input box
    * context.notifier is a wrapper for notification runs in both main process and renderer process, it has only one method is `notify(title, options)`, please see [html5 notification](http://devdocs.io/dom/notification)

## exec()
### exec(args, event, cmdInfo)

* args(array): the command args array that not including command key
* event: event.sender.send() , please see [electron docs](http://electron.atom.io/docs/api/ipc-main/#sending-messages)
* cmdInfo(object): raw object of command
  * key: key,
  * script: path.resolve(config.dataPath, plugin.script),
  * args: args,
  * config: plugin.config || {}

### return
```js
let items =[{
  name: 'HAHA',
  icon: `${__dirname}/assets/shell.png`,
  value: args,// for item.value in execItem
  detail: '',
  opts: [{name: 'exec',label: 'Exec'}]//option buttons for item.opt , the first is default
}])
event.sender.send('exec-reply', items)
```

## execItem()
### execItem(item, event)

* item(object):
  * item.value: the value of item, mostly is `args.join(' ')`
  * item.opt: the name of option in item, this could be undefined if no opts in reply of exec method
* event: like event in exec

### return
```js
event.sender.send('exec-item-reply')//this would cause the mainWindow to hide
```
