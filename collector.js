'use strict'

const { exists, writeFile, readFileSync } = require('fs')
const { dirname, joinSafe } = require('upath')
const { getTime, getDay } = require(`${__dirname}/prettyDate`)
const ensureFile = require('ensure-file')
const prefix = joinSafe(__dirname, 'data')
const data = []
const dumpOnAdd = true
let name = `${getDay()}.json`
let fileParsed = false

function merge(prevData) {
  prevData.forEach(d => data.unshift(d))
}

function parseFile(fileName) {
  let ret = []
  try{
    const content = readFileSync(fileName, { encoding: 'utf8'} )
    if( !!content ){
      ret = JSON.parse(content)
    }
  }catch(e){}
  return ret
}

function ensure(fileName, callback) {
  exists(fileName, (ex) => {
    if( ex ){
      return callback(null)
    }
    ensureFile(fileName, callback)
  })
}

function dumpData(callback) {
  const fileName = joinSafe(prefix, name)
  ensure(fileName, ( err ) => {
    if( err ){
      return callback(err)
    }
    if( !fileParsed ){
      merge(parseFile(fileName))
      fileParsed = true
    }
    writeFile(fileName, JSON.stringify(data, null, 2), callback)
  })
}

function add(datapoint) {
  data.push({ [getTime()]: datapoint })
  if( dumpOnAdd ){
    dumpData((err) => {
      if( err ){
        console.log('Dump failed', err)
      }
    })
  }
}

function setFileName(newName) {
  name = newName
}

function dump(callback) {
  if( dumpOnAdd ){
    // if dumping on each add no need to dump now
    callback(null)
  }else{
    dumpData(callback)
  }
}

module.exports = {
  add: add,
  setFileName: setFileName,
  dump: dump
}
