const fs = require('fs')

// init symlinks
const localsDstPath = './src/pref/locales'

if (!fs.existsSync(localsDstPath)) {
  fs.symlinkSync('../../app/browser/pref/locales/', localsDstPath, 'dir')
}
