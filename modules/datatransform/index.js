'use strict'

const { Transform } = require('stream')
const converter = require('../converter')

/**
 * Transform stream that takes column names from first row and add them to each object on each row
 * @param parser - Need the parser stream to know when the first chunk (column names row) is received
 * @returns {*}
 */
const addKeyNameToFields = (parser) => {
  let keys = []

  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (chunk, encoding, callback) {
      if (parser.info.records === 1) {
        keys = chunk
      } else {
        let parsedObject = {}
        keys.forEach((key, keyIndex) => {
          parsedObject[key] = chunk[keyIndex]
        })
        this.push(parsedObject)
      }
      callback()
    }
  })
}

/**
 * Transform stream that convert each row according the given fields map
 * @param newFieldsMap
 * @param extraFieldsMap
 * @param fieldsToExclude
 * @returns {*}
 */
const convertObjectByMap = (newFieldsMap, extraFieldsMap, fieldsToExclude) => {
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (chunk, encoding, callback) {
      let convertedRow = converter.convertObjectByMap({
        dataObject: chunk,
        newFieldsMap: newFieldsMap,
        extraFieldsMap: extraFieldsMap(),
        fieldsToExclude: fieldsToExclude
      })
      this.push(convertedRow)
      callback()
    }
  })
}

module.exports = {
  addKeyNameToFields,
  convertObjectByMap
}
