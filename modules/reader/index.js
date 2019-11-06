'use strict'

const csv = require('csv')
const fs = require('fs')
const Logger = require('../logger')

/**
 * @module Parser
 * @exports Parser module
 * @description Static class parsing the files
 */
module.exports = class Parser {
  /**
   * @name getFileKeys
   * @description Extract the keys from data that was extracted by this class
   * @param parsedData
   * @returns {String[]}
   */
  static getFileKeys (parsedData = []) {
    if (parsedData.length) {
      const keys = parsedData[ 0 ]
      // Logger.log(`keys - ${keys}`)
      return keys
    } else {
      Logger.error('no keys for file')
      return []
    }
  }

  /**
   * Returns if a file key exists
   * @param fileKey
   * @return {boolean}
   */
  static isFileKeyExists (path) {
    if (fs.existsSync(path)) {
      return true
    }
    return false
  }

  /**
   * @name getFilesDataObjects
   * @description returns an array of objects from the parsed data
   * @param parsedData
   * @returns {Object[]}
   */
  static getFilesDataObjects (parsedData = []) {
    const keys = Parser.getFileKeys(parsedData)

    const parsedObjects = parsedData.map((parsedRow, rowIndex) => {
      if (rowIndex > 0) { //
        let parsedObject = {}
        keys.forEach((key, keyIndex) => {
          parsedObject[ key ] = parsedRow[ keyIndex ]
        })

        return parsedObject
      } else {
        return {}
      }
    })

    parsedObjects.shift() // remove the keys - the first row in the file
    return parsedObjects
  }

  /**
   * Read a csv file from source and returns that file in an array form
   * @param {string} filePath - The file path to parese
   * @param {String} delimiter - The delimiter of the file
   * @returns {Promise}
   */
  static readFile (filePath, delimiter) {
    const readPromise = new Promise((resolve, reject) => {
      try {
        const parser = csv.parse({ delimiter: delimiter, relax: true }, (err, data) => {
          if (err) {
            const message = `an error occurred while opening file ${filePath}`
            Logger.error(message, err)
            reject(err)
          } else {
            resolve(data)
          }
        })

        const fileStream = fs.createReadStream(filePath)

        fileStream.on('open', () => {
          Logger.log(`opened file ${filePath}`)
          fileStream.pipe(parser)
        })

        fileStream.on('error', (error) => {
          const message = `an error occurred while opening file ${filePath}`
          Logger.error(message, error)
          reject(message)
        })
      } catch (e) {
        const message = `an error occurred while parsing ${filePath}`
        Logger.error(message, e)
        reject(message)
      }
    })
    return readPromise
  }

  /**
   *
   * @param filePath
   * @param delimiter
   * @returns {*}
   */
  static readFileStream (filePath, delimiter) {
    try {
      const parser = csv.parse({ delimiter: delimiter, relax_column_count: true })
      const fileStream = fs.createReadStream(filePath)

      fileStream.on('error', (error) => {
        const message = `an error occurred while opening file ${filePath}`
        Logger.error(message, error)
        throw error
      })

      return fileStream.pipe(parser)
    } catch (error) {
      const message = `an error occurred while parsing ${filePath}`
      Logger.error(message, error)
      throw new Error(message)
    }
  }
}
