/*eslint new-cap: ["error", { "newIsCap": false }]*/
'use strict'

const winston = require('winston')

/**
 * @module Progress
 * @description module that provides a progress notification
 */

const wLogger = new winston.createLogger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      timestamp: true
    })
  ]
})

class Progress {
  /**
   * @function report
   * @description logging a string
   * @param {String} message - the string we want to log
   */
  static report () {
    /**
     * display the message from this map
     */
    return wLogger.info(...arguments)
  }
}

module.exports = Progress
