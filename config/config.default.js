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
      default: true,
      config: {}
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
        type: 'find',
        include_path: ['~/'],
        exclude_path: ['**/.*','**/node_*'],
        // maxdepth: 10,
        limit: 20
      }
    }
  }
}
