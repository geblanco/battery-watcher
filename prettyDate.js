'use strict'

module.exports = {
  getDay: () => (new Date().toLocaleDateString()).replace(/\//g, '_'),
  getTime: (withMillis = false) => {
    let ret = []
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
    ret.push(hours)
    ret.push(minutes)
    ret.push(seconds)
    if( withMillis ){
      ret.push(millis)
    }
    return ret.join(':')
  }
}