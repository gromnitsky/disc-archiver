'use strict'

let assert = require('assert')
let util = require('util')
let exec = require('child_process').execSync
let path = require('path')
let fs = require('fs')

suite('disc-archiver-gt', function() {

    suiteSetup(function() {
	if (process.platform === "win32") this.skip()

	this.tmp = fs.mkdtempSync(path.join(__dirname, 'tmp.'))
	this.save_dir = process.cwd()
	process.chdir(this.tmp)
    })

    suiteTeardown(function() {
	process.chdir(this.save_dir)
	exec(`rm -rf ${this.tmp}`)
    })

    test('the example from readme', function() {
	exec('head -c 1 < /dev/urandom > boot.dump.aes')
	exec('head -c 20 < /dev/urandom > home.dump.aes')
	exec('head -c 40 < /dev/urandom > root.dump.aes')

	exec('../../disc-archiver-calc 25 *aes | ../../disc-archiver-gt > Makefile')
	exec('make', { stdio: ['ignore', 'pipe', 'pipe'] })

	let files = exec('find . -type f').toString().trim().split("\n").sort()
	assert.deepEqual([ './Makefile',
			   './boot.dump.aes',
			   './home.dump.aes',
			   './out/iso/1.iso',
			   './out/iso/2.iso',
			   './out/iso/3.iso',
			   './out/src/1/boot.dump.aes',
			   './out/src/1/home.dump.aes',
			   './out/src/1/root.dump.aes.part-1-of-3',
			   './out/src/2/root.dump.aes.part-2-of-3',
			   './out/src/3/root.dump.aes.part-3-of-3',
			   './root.dump.aes' ], files)

	// reassemble
	exec('cat out/src/[0-9]/root* > omglol')
	exec('cmp omglol root.dump.aes')
    })

})
