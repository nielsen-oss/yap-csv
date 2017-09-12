'use strict'

const converter = require('../converter')
const Logger = require('../logger')
const Progress = require('../progress')
const Reader = require('../reader')
const DataTransform = require('../datatransform')
const { Transform } = require('stream')

/**
 * @module Parser
 * @exports Parser module
 * @description Static class for parsing files
 */
module.exports = class Parser {

  /**
   * Reader a single file and returns a fulfilled promise with converted data
   * @name  parseSingle
   * @param {String} fileKey - File key to parse
   * @param {String} filesLocation - the location of the files
   * @return {Promise}
   */
  static parseSingle (fileKey, filesLocation, delimiter = ',', FIELDS_MAP = {}, EXTRA_FIELDS_MAP = () => {}, EXCLUDE_FIELDS = []) {
    const fileName = filesLocation + fileKey

    if (!Reader.isFileKeyExists(fileName)) {
      return Promise.reject(new Error(`file ${fileKey} does not exist`))
    }

    return Reader.readFile(fileName, delimiter).then((parsedData) => {
      let parsedRows = Reader.getFilesDataObjects(parsedData)
      const convertedRows = []
      const printedProgress = []

      Logger.log(`starting conversion ${fileKey}`)
      let unFulfilled = false

      // Convert each row
      parsedRows.forEach((parsedRow, i) => {
        if (Parser.isValidRow(parsedRow)) {
          convertedRows.push(converter.convertObjectByMap({
            dataObject: parsedRow,
            newFieldsMap: FIELDS_MAP,
            extraFieldsMap: EXTRA_FIELDS_MAP(),
            fieldsToExclude: EXCLUDE_FIELDS
          }))
        } else {
          unFulfilled = true
        }

        const currentProgress = Parser.getCurrentParseProgress(i, parsedRows.length, fileKey)
        if (!printedProgress.includes(currentProgress)) {
          printedProgress.push(currentProgress)
          Progress.report(`${fileKey} progress ${currentProgress}%`)
        }
      })

      if (unFulfilled) {
        Logger.error(`file ${fileKey} has empty rows`)
      }

      if (convertedRows.length !== parsedRows.length) {
        Logger.error(`${fileKey} is not the same size as converted expected ${parsedRows.length} got ${convertedRows.length}`)
      }

      Logger.log(`COMPLETED: file ${fileKey} with ${convertedRows.length} rows`)
      return Promise.resolve(convertedRows)
    })
  }

  /**
   * Validated that there are no empty or nullified (including null string)
   * @param dataObject
   * @return {boolean}
   */
  static isValidRow (dataObject = {}) {
    return Object.keys(dataObject).every((key) => {
      return dataObject[ key ] != null && dataObject[ key ] !== '' && dataObject[ key ] !== 'NULL'
    })
  }

  /**
   * Gets progress of parsing data
   * @name getCurrentParseProgress
   * @description Returns progress of parsing data
   * @param {Number} index - The currently parsed row
   * @param {Number} totalSize - Number of total rows
   * @param {String} fileKey - The file key
   * @return {Number} - THe current progress
   */
  static getCurrentParseProgress (index, totalSize, fileKey) {
    const percentagesRound = 2
    const totalPercentage = (index / totalSize) * 100
    const percentageProgressToFive = Math.ceil(totalPercentage / percentagesRound) * percentagesRound // nearest dividable by percentagesRound

    return percentageProgressToFive
  }

  /**
   *
   * @param fileKey
   * @param filesLocation
   * @param delimiter
   * @param FIELDS_MAP
   * @param EXTRA_FIELDS_MAP
   * @param EXCLUDE_FIELDS
   * @returns {*}
   */
  static parseSingleStream (fileKey, filesLocation, delimiter = ',', FIELDS_MAP = {}, EXTRA_FIELDS_MAP = () => {}, EXCLUDE_FIELDS = []) {
    try {
      const fileName = filesLocation + fileKey
      const parser = Reader.readFileStream(fileName, delimiter)

      // Report Progress
      const reportProgress = new Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform (chunk, encoding, callback) {
          Progress.report(`${fileKey} - Processing row ${parser.count}`)
          this.push(chunk)
          callback()
        }
      })

      return parser
        .pipe(DataTransform.addKeyNameToFields(parser))
        .pipe(DataTransform.convertObjectByMap(FIELDS_MAP, EXTRA_FIELDS_MAP, EXCLUDE_FIELDS))
        .pipe(reportProgress)
    } catch (error) {
      throw error
    }
  }
}
