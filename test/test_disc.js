'use strict'

let assert = require('assert')
let util = require('util')

let Disc = require('../disc-calc').Disc
let DiscArray = require('../disc-calc').DiscArray

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

suite('DiscArray', function() {

    test('save 3 files, 2 of which fit in 1 disc', function() {
	let da = new DiscArray(4)
	da.save({ name: 'small-1', size: 2 })
	da.save({ name: 'big', size: 3 })
	da.save({ name: 'small-2', size: 2 })

	assert.equal(0, da.storage[0].free)
	assert.equal(2, da.storage[0].files.length)
	assert.equal('big', da.storage[1].files[0].name)

//	console.log(util.inspect(da, {depth: null}))
    })

    test('save 1 big file that is too big to fit in 1 disc', function() {
	let da = new DiscArray(4)
	da.save({ name: 'big', size: 6 })

	assert.equal(0, da.storage[0].files[0].pos_from)
	assert.equal(3, da.storage[0].files[0].pos_to)
	assert.equal(4, da.storage[1].files[0].pos_from)
	assert.equal(5, da.storage[1].files[0].pos_to)

//	console.log(util.inspect(da, {depth: null}))
    })

})
