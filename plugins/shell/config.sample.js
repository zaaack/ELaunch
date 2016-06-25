// sample configuration in `~/.ELaunch/config.js`
module.exports = {
  // other config properties
  plugins: {
    //config for other plugins
    shell: {
      // script: `${__dirname}/../plugins/shell/index.js`, //the path of the plugin
      config: { //default plugin config
        terminal: 'node', //default
        //terminal: 'platform', //you can set `platform` to auto run commands below in different platform,or just custom commands

        // terminal: 'gnome-terminal -x $SHELL -c \'%s;exec $SHELL\'',//default is 'node', 'gnome-terminal -x $SHELL -c '%s;exec $SHELL\'' // for linux
        //terminal: `osascript -e "tell application \\"Terminal\\""
                        // -e "activate"
                        // -e "do script \\"%s\\""
                        // -e "end tell"` // for mac
        //terminal: `osascript -e "tell application \\"iTerm\\""
                      // 	-e "activate"
                      // 	-e "set t to create tab with default profile window 1"
                      // 	-e "write current session in t text \\"%s\\""
                      //  -e "end tell"` //for iterm2 in mac
        //terminal: 'cmd /k "%s"' //for windows

      },
      command:{
        '>':{}
      }
    }
  }
}
