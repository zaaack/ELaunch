module.exports = {
  title: 'ELaunch',
  width: 600,
  height: 60,
  max_height: 500,
  position: 'center', // 'center' or {x: 100, y:200}
  shotcut: {
    toggle: {
      default: 'Super+Space',
      win32: 'Super+Space',
      linux: 'Super+Space',
      darwin: 'Super+Space'
    }
  },
  plugins: {
    app: {
      path: `${__dirname}/../plugins/app/index.js`,
      enable: true, //whether the plugin is enable, default is true
      default: true, // default plugin don't need to input key
      config: {
        darwin: {
          app_path: ['/Applications','/Users/z/Applications']
        },
        linux: {
          app_path: ['/usr/share/applications',
            '/usr/local/share/applications',
            '/home/z/.local/share/applications'],
          icon_path: ['/usr/share/icons',
            '/home/z/.local/share/icons',
            '/usr/share/pixmaps']
        },
        win32:{
          init_on_start: true
        }
      },
      command: {
        app: {}
      }
    },
    find: {
      path: `${__dirname}/../plugins/find/index.js`,
      config: {
        // type: 'locate',
        // db_path: require('os').homedir()+'/.ELaunch/find/locate.db',
        // root_dir: '/home',
        // exclude_patt: '\\/\\.|node_modules', //exclude hidden files
        // use_regex: false,
        // locate_limit: 1000,

        linux:{

          // type: 'find',
          // include_path: ['~/'],
          // exclude_path: ['**/.*','**/node_*'],
          // maxdepth: 10,

          type: 'locate',
          root_dir: '~',
          // exclude_patt: '\\/\\.|node_modules|Programs' //exclude hidden files
        },
        darwin:{
          type:'mdfind',//Notice: mdfind only search the first path in `include_path`, and ignore `exclude_path`, plz set exclude_path in spotlight settings
          root_dir: '~/',
          exclude_path: ['**/.*','**/node_*','**/Library','**/Contents'],// /(?!(.*?/\.)|(.*?/node_)).*?a/
        },
        limit: 20
      },
      command: {
        find: {}
      }
    },
    websearch: {
      path: `${__dirname}/../plugins/websearch/index.js`,
      command:{
        bi: {
          engine: 'Bing',
          url: 'https://www.bing.com/search/?q=%s',
          icon: 'https://cn.bing.com/sa/simg/bing_p_rr_teal_min.ico'
        },
        bd: {
          engine: 'Baidu',
          url: 'https://www.baidu.com/s?wd=%s',
          icon: 'https://www.baidu.com/img/baidu.svg'
        },
        gh: {
          engine: 'Github',
          url: 'http://github.com/search?q=%s',
          icon: 'https://github.com/fluidicon.png'
        }
      }
    },
    shell: {
      path: `${__dirname}/../plugins/shell/index.js`,
      config: {

        terminal: 'node', //default
        //terminal: 'platform', //you can set `platform` to auto use different shell in different platform: gnome-terminal for linux, Terminal.app for MacOS and cmd.exe for windows

        // use custom shell to run command
        // terminal: 'gnome-terminal -x $SHELL -c \'%s;exec $SHELL\'',//default is 'node', 'gnome-terminal -x $SHELL -c '%s;exec $SHELL\'' // for linux
        //terminal: `osapath -e "tell application \\"Terminal\\""
                        // -e "activate"
                        // -e "do path \\"%s\\""
                        // -e "end tell"` // for mac
        //terminal: `osapath -e "tell application \\"iTerm\\""
                      // 	-e "activate"
                      // 	-e "set t to create tab with default profile window 1"
                      // 	-e "write current session in t text \\"%s\\""
                      //  -e "end tell"` //for iterm2 in mac
        //terminal: 'cmd /k "%s"' //for windows
      },
      command:{
        '>':{}
      }
    },
    youdao:  {
      path: `${__dirname}/../plugins/youdao/index.js`,
      command:{
        'yd':{}
      }
    },
    calc: {
      path: `${__dirname}/../plugins/calc/index.js`,
      command: {
        calc: {}
      }
    }
  }
}
