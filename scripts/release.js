require('shelljs/global')
const fs = require('fs-extra')

const ver = process.argv[2]
cd('./app')
exec(`npm version ${ver}`)
cd('../')
const appPkg = require('../app/package.json')
const pkg = require('../package.json')
pkg.version = appPkg.version
const msg = process.argv[3] || `v${appPkg.version}`
fs.outputJsonSync(`${__dirname}/../package.json`, pkg, 'utf-8')
exec(`git add -A && git commit -m "${msg}"`)
exec(`git tag ${msg}`)
exec('git push origin dev --tags && git push origin -u dev:master')
