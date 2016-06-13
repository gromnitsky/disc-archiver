'use strict'

let assert = require('assert')

let Disc = require('../dump2dvd').Disc

suite('Disc', function() {

    test('add', function() {
	let d = new Disc(1, 4.3)
	assert(d.add({ name: 'q', size: 1 }))
	assert(d.add({ name: 'w', size: 2 }))
	assert.equal(false, d.add({name: 'e', size: 3}))
//	console.log(d)
    })

    test('add a double should fail', function() {
	let d = new Disc(1, 4.3)
	d.add({ name: 'q', size: 1 })
	assert.throws(() => d.add({ name: 'q', size: 2 }))
    })

    test('add_partial', function() {
	let d = new Disc(1, 4.3)
	assert(d.add_partial({ name: 'q', size: 10 }, 0, 3))
	assert.equal(false, d.add_partial({ name: 'w', size: 10 }, 0, 6))
//	console.log(d)
    })

})
