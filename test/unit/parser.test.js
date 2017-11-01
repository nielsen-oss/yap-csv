'use strict'

const test = require('ava')
const sinon = require('sinon')
const fs = require('fs')
const Parser = require('../../modules/parser')

test('parseSingle - file does not exist', async t => {
  const error = await t.throws(Parser.parseSingle('abc', 'xyz'))

  t.is(error.message, 'file abc does not exist')
})

test('parseSingle - parse CSV', async t => {
  t.plan(2)
  const result = await Parser.parseSingle('test.csv', process.cwd() + '/test/mocks/')

  t.is(result.length, 5)
  t.is(result[0]['First Name'], 'Chris')
})

test('parseSingle - parse CSV with fields map', async t => {
  t.plan(4)

  const FIELDS_MAP = {
    'First Name': 'firstName',
    'Last Name': {
      name: 'lastName',
      type: (dataObj) => {
        return dataObj['Last Name'].toLowerCase()
      }
    },
    'ZIP or Postal Code': {
      name: 'zip',
      type: 'Number'
    },
    'Salary': {
      name: 'salary',
      type: 'NumberDouble'
    }
  }
  const result = await Parser.parseSingle('test.csv', process.cwd() + '/test/mocks/', ',', FIELDS_MAP)

  t.is(result.length, 5)
  t.truthy(result[0].hasOwnProperty('firstName'))
  t.truthy(result[0].hasOwnProperty('lastName'))
  t.is(result[0]['lastName'], 'green')
})

test('parseSingle - parse CSV with invalid row', async t => {
  t.plan(1)

  const result = await Parser.parseSingle('invalid.csv', process.cwd() + '/test/mocks/')

  t.is(result.length, 4)
})

test('parseSingle - parse CSV with extra field', async t => {
  t.plan(3)

  const EXTRA_FIELDS_MAP = () => {
    return {
      email: (convertedDataObj) => {
        return convertedDataObj['User Name']
      }
    }
  }

  const result = await Parser.parseSingle('test.csv', process.cwd() + '/test/mocks/', ',', {}, EXTRA_FIELDS_MAP)

  t.is(result.length, 5)
  t.truthy(result[0].hasOwnProperty('email'))
  t.is(result[0]['email'], 'chris@contoso.com')
})

test('parseSingleStream - parse CSV', async t => {
  t.plan(5)
  const expectedUsers = ['chris@contoso.com', 'ben@contoso.com', 'david@contoso.com', 'cynthia@contoso.com', 'melissa@contoso.com']
  const parser = await Parser.parseSingleStream('test.csv', process.cwd() + '/test/mocks/')
  let data = []

  parser.on('data', function (chunk) {
    data.push(chunk)
  })

  await new Promise((resolve, reject) => {
    parser.on('end', function () {
      data.forEach((row, index) => {
        t.is(row['User Name'], expectedUsers[index], 'User Name should be as expected')
      })
      resolve()
    })
  })
})

test('parseSingleStream - error', async t => {
  const fileName = 'test.csv'
  const filePath = process.cwd() + '/test/mocks/'
  sinon.stub(fs, 'createReadStream').returns(null)

  const error = await t.throws(() => {
    Parser.parseSingleStream(fileName, filePath)
  }, Error)

  t.is(error.message, `an error occurred while parsing ${filePath}${fileName}`)
  fs.createReadStream.restore()
})

