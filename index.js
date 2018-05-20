'use strict'

const { joinSafe } = require('upath')

if( process.argv.length <= 2 ){
  return require(joinSafe(__dirname, 'daemon')).start( joinSafe(__dirname, 'samples/rooster.mp3') )
}

const { spawn } = require('child_process')

const child = spawn('electron', [joinSafe(__dirname, 'app')], {stdio: 'inherit'})

child.on('close', function (code) {
  process.exit(code)
})
