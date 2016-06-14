'use strict'

let assert = require('assert')
let util = require('util')

let NumberParser = require('../disc-archiver-calc').NumberParser

suite('NumberParser', function() {

    test('parse', function() {
	assert.equal(1, NumberParser.parse('1'))
	assert.equal(111, NumberParser.parse('1,1.1 '))
	assert.equal(25025314816, NumberParser.parse(' bd  '))
    })

    test('parse invalid', function() {
	assert.throws( ()=> NumberParser.parse('') )
	assert.throws( ()=> NumberParser.parse(', ') )
	assert.throws( ()=> NumberParser.parse(' d ') )
    })

})
