'use strict'

const isCharging = require('is-charging')
const batteryLevel = require('battery-level')
const player = require('play-sound')()
const notifier  = require('node-notifier')
const { joinSafe } = require('upath')
const { add, dump } = require(`${__dirname}/collector.js`)

const minThreshold = 10
const ONE_HOUR = 60 * 60 * 1000

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

const date = () => {
  let date = new Date()
  let hours = `${date.getHours()}`
  let minutes = `${date.getMinutes()}`
  let seconds = `${date.getSeconds()}`
  let millis = `${date.getMilliseconds()}`
  if( hours < 10 ){
    hours = `0${date.getHours()}`
  }
  if( minutes < 10 ){
    minutes = `0${date.getMinutes()}`
  }
  if( seconds < 10 ){
    seconds = `0${date.getSeconds()}`
  }
  if( millis < 100 ){
    millis = `0${date.getMilliseconds()}`
  }
  return `[${hours}:${minutes}:${seconds}.${millis}]`
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
      console.log(`${date()}... error: ${error} end`)
      // Show error to user
      return
    }

    let schedule = charging ? ONE_HOUR : ONE_HOUR / 6
    let batteryLevel = parseInt(level * 100)
    
    if( charging ){
      console.log(`${date()} => Charging... schedule to ${schedule / (60 * 1000)} minutes`)
    }else{

      add(batteryLevel)
      if( batteryLevel < minThreshold ){
        // one minute
        schedule = ONE_HOUR / 60
        // Make a sound
        sound( soundSample )
        notify( batteryLevel )
      }

      console.log(`${date()} => Not charging... ${parseInt(level * 100)}% left, schedule to ${schedule / (60 * 1000)} minutes`)
    }

    if( daemonTimer ){
      clearTimeout(daemonTimer)
    }
    daemonTimer = setTimeout(work, schedule)
  })
}

const startDaemon = ( samplePath ) => {
  console.log(`${date()} => Start Daemon`)
  soundSample = samplePath
  work()
}

process.on('SIGINT', () => {
  console.log('Closing...')
  const fileName = `${(new Date().toLocaleDateString()).replace(/\//g, '_')}.log`
  dump(fileName, (err) => {
    if( err ){
      console.log('End with error', err)
    }
    console.log('Done')
    process.exit(err ? 1 : 0)
  })
})

module.exports = { start: startDaemon }
