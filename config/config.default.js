module.exports = {
  update_delay: 3000,
  plugins: {
    app: {
      script: `${__dirname}/../plugins/app/index.js`,
      default: true,
      config: {}
    },
    find: {
      script: `${__dirname}/../plugins/find/index.js`,
      default: true,
      config: {
        db_path: require('os').homedir()+'/.ELaunch/find/locate.db',
        root_dir: '/home',
        // include_dirs: ['/z'], //only dirs under root_dir, default 'all'
        include_dirs: 'all',
        exclude_path: ['/tmp'],
        exclude_ext: ['.git', '.bzr','.hg','.svn'],
        update_delay: 10000,
        use_regex: false,
        limit: 20
      }
    }
  }
}
