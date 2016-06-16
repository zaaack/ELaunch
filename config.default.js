module.exports = {
  plugins: {
    app: {
      script: `${__dirname}/plugins/app/index.js`,
      default: true,
      config: {}
    },
    find: {
      script: `${__dirname}/plugins/find/index.js`,
      default: true,
      config: {}
    }
  }
}
