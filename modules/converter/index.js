'use strict'

const _ = require('lodash')
const constants = require('./constants')

/**
 *
 * @param {Object} dataObject - the object to convert
 * @param {Object} newFieldsMap - a map between old field names and new field names
 * @param {Object} extraFieldsMap - a map to add extra fields that are not in the original object. each value is a function that gets the converteed object
 * @return {{}}
 */
const convertObjectByMap = ({dataObject = {}, newFieldsMap = {}, extraFieldsMap = {}, fieldsToExclude = []}) => {
  let convertedObject = {}

  Object.keys(dataObject).forEach((dataKey) => {
    const newKeyMetaData = newFieldsMap[ dataKey ] || dataKey
    let keyToUse = null
    const keyValue = dataObject[ dataKey ]
    let value = keyValue

    if (!fieldsToExclude.includes(dataKey)) {
      // specified name and type
      if (_.isObject(newKeyMetaData)) {
        keyToUse = newKeyMetaData.name

        // Converting to types
        if (_.isFunction(newKeyMetaData.type)) {
          value = newKeyMetaData.type(dataObject)
        } else if (newKeyMetaData.type === constants.NUMBER_TYPE) {
          value = parseInt(keyValue, 10)
        } else if (newKeyMetaData.type === constants.NUMBER_DOUBLE_TYPE) {
          value = parseFloat(keyValue)
        }
      } else {
        keyToUse = newKeyMetaData
      }

      if (_.isObject(convertedObject[keyToUse])) {
        convertedObject[keyToUse] = Object.assign(convertedObject[keyToUse], value)
      } else {
        convertedObject[keyToUse] = value
      }
    }
  })

  const extraFields = Object.keys(extraFieldsMap).map((extraFieldKey) => {
    return {
      [extraFieldKey]: extraFieldsMap[extraFieldKey](convertedObject)
    }
  })

  Object.assign(convertedObject, ...extraFields)

  return convertedObject
}

module.exports = {
  convertObjectByMap
}
