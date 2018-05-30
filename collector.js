'use strict'

const { writeFile } = require('fs')
const ensureFile = require('ensure-file')
const { dirname, joinSafe } = require('upath')
const prefix = joinSafe(__dirname, 'data')
const data = []

function add(datapoint) {
  data.push(datapoint)
}

function dump(name, callback) {
  const fileName = joinSafe(prefix, name)
  ensureFile(fileName, ( err ) => {
    if( err ){
      return callback(err)
    }
    writeFile(fileName, JSON.stringify(data, null, 2), callback)
  })
}

module.exports = {
  add: add,
  dump: dump
}
