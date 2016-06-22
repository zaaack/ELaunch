module.exports = {
  title: 'ELaunch',
  width: 600,
  height: 60,
  shotcut: {
    default: 'Super+Space',
    win32: 'Super+Space',
    linux: 'Super+Space',
    darwin: 'Super+Space'
  },
  plugins: {
    app: {
      script: `${__dirname}/../plugins/app/index.js`,
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
        }
      },
      command: {
        app: {}
      }
    },
    find: {
      script: `${__dirname}/../plugins/find/index.js`,
      config: {
        // type: 'locate',
        // db_path: require('os').homedir()+'/.ELaunch/find/locate.db',
        // root_dir: '/home',
        // exclude_patt: '\\/\\..*|node_modules', //exclude hidden files
        // use_regex: false,
        // locate_limit: 1000,

        linux:{

          type: 'find',
          include_path: ['~/'],
          exclude_path: ['**/.*','**/node_*'],
          // maxdepth: 10,
        },
        darwin:{
          type:'mdfind',//Notice: mdfind only search the first path in `include_path`, and ignore `exclude_path`, plz set exclude_path in spotlight settings
          include_path: ['~/'],
          exclude_path: ['**/.*','**/node_*','**/Library','**/Contents'],
        },
        limit: 20
      },
      command: {
        find: {}
      }
    },
    websearch: {
      script: `${__dirname}/../plugins/websearch/index.js`,
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
      script: `${__dirname}/../plugins/shell/index.js`,
      config: {
        // terminal: 'gnome-terminal -x $SHELL -c \'%s;exec $SHELL\'',//default is 'node', 'gnome-terminal -x $SHELL -c '%s;exec $SHELL\''
      },
      command:{
        '>':{}
      }
    },
    youdao:  {
      script: `${__dirname}/../plugins/youdao/index.js`,
      command:{
        'yd':{}
      }
    }
  }
}
