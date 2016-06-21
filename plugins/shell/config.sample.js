// sample configuration in `~/.ELaunch/config.js`
module.exports = {
  // other config properties
  plugins: {
    //config for other plugins
    shell: {
      // script: `${__dirname}/../plugins/shell/index.js`, //the path of the plugin
      config: { //default plugin config
        terminal: 'node', //default
        // terminal: 'gnome-terminal -x $SHELL -c \'%s;exec $SHELL\'',//default is 'node', 'gnome-terminal -x $SHELL -c '%s;exec $SHELL\''
      },
      command:{
        '>':{},
        'exec': { //custom plugin config for command
          terminal: 'gnome-terminal -x $SHELL -c \'%s;exec $SHELL\''
        }
      }
    }
  }
}
