'use strict'

let assert = require('assert')
let util = require('util')

let Disc = require('../disc-archiver-calc').Disc
let DiscArray = require('../disc-archiver-calc').DiscArray

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

    test('saving a 0 length file should fail', function() {
	let da = new DiscArray(4)
	assert.equal(false, da.save({ name: 'empty', size: 0 }))
	assert.equal(0, da.storage[0].files.length)
    })

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

    test('save 1 big file onto 3 little discs', function() {
	let da = new DiscArray(1)
	da.save({ name: 'big', size: 3 })

	assert.equal(3, da.storage.length)
	assert.equal(2, da.storage[2].files[0].pos_from)
	assert.equal(2, da.storage[2].files[0].pos_to)

//	console.log(util.inspect(da, {depth: null}))
    })

    test('save 1 big file onto 3 discs', function() {
	let da = new DiscArray(3)
	da.save({ name: 'small-1', size: 2 })
	da.save({ name: 'small-2', size: 2 })
	da.save({ name: 'big', size: 6 })

	assert.equal(4, da.storage.length)
	// a chunk of 'big' on the 1st disc
	assert.equal(0, da.storage[0].files[1].pos_from)
	assert.equal(0, da.storage[0].files[1].pos_to)

	// a chunk of 'big' on the 2nd disc
	assert.equal(1, da.storage[1].files[1].pos_from)
	assert.equal(1, da.storage[1].files[1].pos_to)

	// a chunk of 'big' on the 3rd disc
	assert.equal(2, da.storage[2].files[0].pos_from)
	assert.equal(4, da.storage[2].files[0].pos_to)

	// a chunk of 'big' on the 4th disc
	assert.equal(5, da.storage[3].files[0].pos_from)
	assert.equal(5, da.storage[3].files[0].pos_to)

//	console.log(util.inspect(da, {depth: null}))
    })

    test('1 byte to the last disc', function() {
	let da = new DiscArray(7200)
	da.save({ name: 'index.md', size:  17})
	da.save({ name: 'all.md', size:  618})
	da.save({ name: 'synopsis.md', size:  985})
	da.save({ name: '_toc.md', size:  1288})
	da.save({ name: 'string_decoder.md', size:  2384})
	da.save({ name: 'tty.md', size:  3132})
	da.save({ name: 'v8.md', size:  3192})
	da.save({ name: 'documentation.md', size: 3415 })
	da.save({ name: 'timers.md', size:  3555})
	da.save({ name: 'punnycode.md', size:  3647})
	da.save({ name: 'debugger.md', size: 5554 })
	da.save({ name: 'globals.md', size: 5599 })
	da.save({ name: 'cli.md', size: 5975 })
	da.save({ name: 'https.md', size: 7463 })

//	console.log(util.inspect(da, {depth: null}))
    })

})
