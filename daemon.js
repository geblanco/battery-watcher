'use strict'

const isCharging = require('is-charging')
const batteryLevel = require('battery-level')
const player = require('play-sound')()
const notifier  = require('node-notifier')
const { joinSafe } = require('upath')
const { getTime, getDay } = require(`${__dirname}/prettyDate`)

const minThreshold = 10
const ONE_HOUR = 60 * 60 * 1000
// Every 5 minutes
const SCHEDULE_TIME = ONE_HOUR / 6 / 2

let daemonTimer = null
let soundSample = null

const sound = ( samplePath ) => {
  // TODO => Present error
  player.play(samplePath, { afPlay: ['-v', 100]}, ( err ) => {})
}

const notify = (level) => {
  notifier.notify({
    title: 'Battery is draining',
    icon: joinSafe(__dirname, 'icons/battery.png'),
    message: `Charge your laptop, only ${level}% left`
  })
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
  // If charging schedule to 60 min
  // Else if schedule in relation to battery left
  levelAndCharge(( err, charging, level ) => {
    
    if( err ){
      console.log(`${getTime()}... error: ${err} end`)
      // Show error to user
      return
    }

    let schedule = charging ? ONE_HOUR : SCHEDULE_TIME
    let scheduleMinutes = schedule / (60 * 1000)
    let batteryLevel = parseInt(level * 100)
    
    if( charging || batteryLevel === 100 ){
      console.log(`${getTime()} => Charging... schedule to ${scheduleMinutes} minutes`)
    }else{
      if( batteryLevel < minThreshold ){
        // one minute
        schedule = ONE_HOUR / 60
        scheduleMinutes = schedule / (60 * 1000)
        // Make a sound
        sound( soundSample )
        notify( batteryLevel )
      }

      console.log(`${getTime()} => Not charging... ${parseInt(level * 100)}% left, schedule to ${scheduleMinutes} minutes`)
    }

    if( daemonTimer ){
      clearTimeout(daemonTimer)
    }
    daemonTimer = setTimeout(work, schedule)
  })
}

const startDaemon = ( samplePath ) => {
  console.log(`${getTime()} => Start Daemon`)
  soundSample = samplePath
  work()
}

const stopDaemon = (kill = true, callback = () => {}) => {
  console.log('Closing daemon...')
  console.log('Daemon done')
  callback()
  if( kill ){
    process.exit(err ? 1 : 0)
  }
}

process.on('SIGINT', () => stopDaemon(true))

module.exports = { start: startDaemon, stop: stopDaemon }
