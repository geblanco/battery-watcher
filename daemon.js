'use strict'

const isCharging = require('is-charging')
const batteryLevel = require('battery-level')
const player = require('play-sound')()
const ONE_HOUR = 60 * 60 * 1000

const levels = [
  {
    level: [100, 75],
    timeout: ONE_HOUR
  }, {
    level: [75, 50],
    // 45 Minutes
    timeout: ONE_HOUR - parseInt(ONE_HOUR / 4)
  }, {
    level: [50, 35],
    // 30 Minutes
    timeout: parseInt(ONE_HOUR / 2)
  }, {
    level: [35, 15],
    // 15 Minutes
    timeout: parseInt(ONE_HOUR / 4)
  }, {
    level: [15, 8],
    // 5 Minutes
    timeout: parseInt(ONE_HOUR / 20)
  }, {
    level: [8, 0],
    // 1 Minute
    timeout: parseInt(ONE_HOUR / 60)
  }
]

let daemonTimer = null

const sound = ( samplePath ) => {
  player.play(samplePath, { afPlay: ['-v', 100]}, ( err ) => {
    // TODO => Present error
  })
}

const getTimeByLevel = ( level ) => {

  level = parseInt( level * 100 )
  const currentLevel = levels.find(filtLevel => filtLevel.level[1] < level && level <= filtLevel.level[0])
  return currentLevel.timeout
}

const depromisify = ( promise, callback ) => {
  promise()
    .then(res => { callback(null, res) })
    .catch(callback)
}

const levelAndCharge = ( callback ) => {
  depromisify(isCharging, ( err, charging ) => {

    if( err ){
      return callback( err )
    }

    depromisify(batteryLevel, ( err, battery ) => {

      if( err ){
        return callback( err )
      }

      callback( null, charging, battery )
    })
  })
}

const startDaemon = ( samplePath ) => {

  console.log('=> Start Daemon')
  // If charging schedule to 60 min
  // Else if schedule in relation to battery left
  levelAndCharge(( err, charging, level ) => {
    
    console.log('=> Battery level' + err ? err : ('charging: ' + charging + ' level: ' + level))
    if( err ){
      console.log('... error end')
      // Show error to user
      return
    }

    if( daemonTimer ){
      clearTimeout(daemonTimer)
    }

    let schedule = ONE_HOUR
    if( charging ){
      console.log('=> Charging... schedule to', schedule)
      daemonTimer = setTimeout(startDaemon, schedule)
    }else{
      schedule = getTimeByLevel(level)
      console.log(`=> Not charging... ${parseInt(level * 100)}% left, schedule to ${schedule / (60 * 1000)} minutes`)
      daemonTimer = setTimeout(startDaemon, schedule)
      // Make a sound
      sound( samplePath )
    }

  })
}

module.exports = { start: startDaemon }