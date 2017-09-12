'use strict'

const test = require('ava')
const Reader = require('../../modules/reader')

test('reader - get CSV keys', async t => {
  t.plan(3)

  const csvContent = await Reader.readFile(process.cwd() + '/test/mocks/test.csv', ',')
  t.is(csvContent.length, 6)

  const keys = Reader.getFileKeys(csvContent)
  t.is(keys.length, 16)
  t.is(keys[0], 'User Name')
})

test('reader - no CSV keys', t => {
  t.plan(1)

  const keys = Reader.getFileKeys([])
  t.is(keys.length, 0)
})

test('reader - invalid file path', async t => {
  t.plan(2)

  const error = await t.throws(Reader.readFile('abc', ','))
  t.is(error, 'an error occurred while opening file abc')
})
