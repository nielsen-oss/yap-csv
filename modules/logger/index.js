'use strict'

const winston = require('winston')

/**
 * @module Logger
 * @description module that provides a collection of loggers for different uses
 */

const wLogger = new winston.createLogger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      timestamp: true
    })
  ]
})

class Logger {
  /**
   * @function log
   * @description logging a string
   * @param {String} message - the string we want to log
   */
  static log () {
    /**
     * display the message from this map
     */
    return wLogger.info(...arguments)
  }

  /**
   * @function error
   * @description logging a string in error context
   * @param {String} message - the string we want to log
   */
  static error () {
    return wLogger.error(...arguments)
  }
}

module.exports = Logger
