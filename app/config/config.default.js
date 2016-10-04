const os = require('os')
const home = os.homedir()

module.exports = {
  title: 'ELaunch',
  width: 600,
  height: 60,
  maxHeight: 500,
  language: null,
  autoLaunch: true,
  position: 'center', // 'center' or {x: 100, y:200}
  // default is your primary display, you can change it by setting display id(integer),
  // get all ids by require('electron').screen.getAllDisplays().map(d=>d.id)
  display: 'primary',
  shortcut: {
    toggle: {
      default: 'Super+Space',
      win32: 'Super+Space',
      linux: 'Super+Space',
      darwin: 'Super+Space',
    },
  },
  plugins: {
    app: {
      path: `${__dirname}/../plugins/app/index.js`,
      enable: true, // whether the plugin is enable, default is true
      default: true, // default plugin don't need to input key
      config: {
        darwin: {
          appPaths: ['/Applications', `${home}/Applications`],
        },
        linux: {
          appPaths: ['/usr/share/applications',
            '/usr/local/share/applications',
            `${home}/.local/share/applications`],
          iconPaths: ['/usr/share/icons',
            `${home}/.local/share/icons`,
            '/usr/share/pixmaps'],
        },
        win32: {
        },
      },
      command: {
        app: {},
      },
    },
    find: {
      path: `${__dirname}/../plugins/find/index.js`,
      config: {
        // type: 'locate',
        // db_path: require('os').homedir()+'/.ELaunch/find/locate.db',
        // rootDir: '/home',
        // exclude_patt: '\\/\\.|node_modules', //exclude hidden files
        // use_regex: false,
        // locate_limit: 1000,

        linux: {

          // type: 'find',
          // include_path: ['~/'],
          // excludePaths: ['**/.*','**/node_*'],
          // maxdepth: 10,

          type: 'locate',
          rootDir: '~',
          // exclude_patt: '\\/\\.|node_modules|Programs' //exclude hidden files
        },
        darwin: {
          // Notice: mdfind only search the first path in `include_path`,
          // and ignore `excludePaths`, plz set excludePaths in spotlight settings
          type: 'mdfind',
          rootDir: '~/',
          excludePaths: ['**/.*', '**/node_*', '**/Library', '**/Contents'],
          // /(?!(.*?/\.)|(.*?/node_)).*?a/
        },
        limit: 20,
      },
      command: {
        find: {},
      },
    },
    webSearch: {
      path: `${__dirname}/../plugins/websearch/index.js`,
      command: {
        bi: {
          engine: 'Bing',
          url: 'https://www.bing.com/search/?q=%s',
          icon: 'https://cn.bing.com/sa/simg/bing_p_rr_teal_min.ico',
        },
        bd: {
          engine: 'Baidu',
          url: 'https://www.baidu.com/s?wd=%s',
          icon: 'https://www.baidu.com/img/baidu.svg',
        },
        gh: {
          engine: 'Github',
          url: 'http://github.com/search?q=%s',
          icon: 'https://github.com/fluidicon.png',
        },
      },
    },
    shell: {
      path: `${__dirname}/../plugins/shell/index.js`,
      config: {

        terminal: 'node', //default
        //terminal: 'platform', //you can set `platform` to auto use different shell in different platform: gnome-terminal for linux, Terminal.app for MacOS and cmd.exe for windows

        // use custom shell to run command
        // terminal: 'gnome-terminal -x $SHELL -c \'%s;exec $SHELL\'',
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
      command: {
        '>': {},
      },
    },
    youdao: {
      path: `${__dirname}/../plugins/youdao/index.js`,
      command: {
        yd: {},
      },
    },
    calc: {
      path: `${__dirname}/../plugins/calc/index.js`,
      command: {
        calc: {},
      },
    },
  },
}
