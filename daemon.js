'use strict'

const isCharging = require('is-charging')
const batteryLevel = require('battery-level')
const player = require('play-sound')()
const notifier  = require('node-notifier')

const minThreshold = 10
const ONE_HOUR = 60 * 60 * 1000

let daemonTimer = null
let soundSample = null

const sound = ( samplePath ) => {
  // TODO => Present error
  player.play(samplePath, { afPlay: ['-v', 100]}, ( err ) => {})
}

const notify = () => {
  levelAndCharge(( err, charging, level ) => {
    if( !err ){
      notifier.notify({
        title: 'Battery is draining',
        message: `Charge your laptop, only ${level} percent left`
      })
    }
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

const work = () => {
  levelAndCharge(( err, charging, level ) => {
    
    if( err ){
      console.log('... error end')
      // Show error to user
      return
    }

    let schedule = charging ? ONE_HOUR : ONE_HOUR / 6
    
    if( level < minThreshold ){
      // one minute
      schedule = ONE_HOUR / 60
      // Make a sound
      sound( soundSample )
      notify()
    }


    if( daemonTimer ){
      clearTimeout(daemonTimer)
    }
    daemonTimer = setTimeout(work, schedule)
  })
}

const startDaemon = ( samplePath ) => {

  console.log('=> Start Daemon')
  soundSample = samplePath
  // If charging schedule to 60 min
  // Else if schedule in relation to battery left
  levelAndCharge(( err, charging, level ) => {
    
    if( err ){
      console.log('... error end')
      // Show error to user
      return
    }

    if( daemonTimer ){
      clearTimeout(daemonTimer)
    }

    // Default 10 mins
    let schedule = charging ? ONE_HOUR : ONE_HOUR / 6
    if( charging ){
      console.log('=> Charging... schedule to', schedule)
    }else{
      console.log(`=> Not charging... ${parseInt(level * 100)}% left, schedule to ${schedule / (60 * 1000)} minutes`)
    }

    daemonTimer = setTimeout(work, schedule)
  })
}

module.exports = { start: startDaemon }