'use strict'

const { exists, writeFile, readFileSync } = require('fs')
const ensureFile = require('ensure-file')
const { dirname, joinSafe } = require('upath')
const { getTime } = require(`${__dirname}/prettyDate`)
const prefix = joinSafe(__dirname, 'data')
const data = []

function add(datapoint) {
  data.push({ [getTime()]: datapoint })
}

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

function dump(name, callback) {
  const fileName = joinSafe(prefix, name)
  ensure(fileName, ( err ) => {
    if( err ){
      return callback(err)
    }
    merge(parseFile(fileName))
    writeFile(fileName, JSON.stringify(data, null, 2), callback)
  })
}

module.exports = {
  add: add,
  dump: dump
}
