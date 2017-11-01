# yap-csv
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) 
[![npm version](https://badge.fury.io/js/%40nielsen-oss%2Fyap-csv.svg)](https://badge.fury.io/js/%40nielsen-oss%2Fyap-csv)
[![Build Status](https://travis-ci.org/nielsen-oss/yap-csv.svg?branch=master)](https://travis-ci.org/nielsen-oss/yap-csv)
<br/>
The purpose of this module is to support converting a csv (with delimiter support) to an array of json objects.<br/> 
Using a custom map that can handle both simple fields renames and more complicated fields that are a result of calculations

## Usage
### Add to project
```bash
yarn add @nielsen-oss/yap-csv
```
### Structure
The module exposes two variables a ```Parser``` and ```ConverterConsts```. <br/>
One is used for the actual parsing process and one provide consts helpers.

#### Simple Usage
```javascript
const {Parser} = require('yap-csv')
// parserPromise is a Promise
const parserPromise = Parser.parseSingle(FILE_NAME, FILE_LOCATION, DELIMITER, FIELDS_MAP, EXTRA_FIELDS_MAP)
parserPromise
.then((formattedData) => {
  // Do what you want with formattedData
})
.catch((e) => {
  console.error(e.stack)
})
```

#### Stream Usage
```javascript
const {Parser} = require('yap-csv')
const formattedData = []
// parserStream is a stream
const parserStream = Parser.parseSingleStream(FILE_NAME, FILE_LOCATION, DELIMITER, FIELDS_MAP, EXTRA_FIELDS_MAP)
parserStream.on('error', (e) => {
  console.error(e.stack)
})
parserStream.on('data', (chunk) => {
  formattedData.push(chunk)
})
parserStream.on('end', () => {
  // Do what you want with formattedData
})
```

#### Fields Specification

* ```FILE_NAME``` - The name of the file being parsed
* ```FILE_LOCATION``` - The location of the file being parsed
* ```DELIMITER``` - The delimiter of the text
* ```FIELDS_MAP``` - A conversion map of the fields
* ```EXTRA_FIELDS_MAP``` - A conversion map for new fields that you would like to add

#### ```FIELDS_MAP```
The following is an example of a map
```javascript
const convertConsts = require('yap-csv').ConverterConsts

const FIELDS_MAP = {
  'FIELD1': 'simple_name_change',
  'FIELD2': {
    name: 'my_custom_number',
    type: convertConsts.NUMBER_TYPE
  },
  'FIELD3': {
    name: 'functional_change',
    type: (dataObj) => {
      return dataObj['FIELD3'].toLowerCase()
    }
  }
}
```

As you can see using the fields map you can:
* Preform simple field name changes
* Convert to the helper types that are provided in this module
* Preform conversions using a specified function that receives the original data object (before conversion)

#### ```EXTRA_FIELDS_MAP``` 
The following is an example of a map of extra fields
```javascript
const EXTRA_FIELDS_MAP = {
  complicatedField: (convertedDataObj) => {
    return convertedDataObj['simple_name_change']
  }
}
```

As you can see using the fields map you can add fields that are not in the original data. <br/>
Each field should be a function that receives that data after it passed the original formatting using the ```FIELDS_MAP```.

#### ```ConverterConsts``` 
The exported consts are:
* ```NUMBER_TYPE```
* ```NUMBER_DOUBLE_TYPE```

According the the types we parse the results to a ```parseInt``` or ```parseFloat```