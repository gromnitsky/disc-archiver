#!/usr/bin/env node

// TODO
let data = function(files) {
    return [
	{
	    name: '__.-0_-h0_-b1024_-z.dump.aes',
	    size: 4.7
	},
	{
	    name: '__boot.-0_-h0_-b1024_-z.dump.aes',
	    size: 1
	},
	{
	    name: '__home.-0_-h0_-b1024_-z.dump.aes',
	    size: 2.2
	}
    ]
}

let data_sort = function(d) {
    return d.sort( (a, b) => a.size - b.size )
}

// an obligatory omglol
let dup = function(obj) {
    return JSON.parse(JSON.stringify(obj))
}

class Disc {
    constructor(name, storage_size) {
	if (!(name && storage_size))
	    throw new Error('name & storage_size required')
	this.name = name
	this.free = storage_size
	this.files = []
	this._file_names_cache = {}
    }

    exists(file) {
	return this._file_names_cache[file.name]
    }

    add(file) {
	if (this.exists(file)) throw new Error(`file ${file.name} is already on disc ${this.name}`)
	if (file.size > this.free) return false

	this.free -= file.size
	this.files.push(file)
	this._file_names_cache[file.name] = true
	return true
    }

    add_partial(file, pos_from, pos_to) {
	if (this.exists(file)) throw new Error(`file ${file.name} is already on disc ${this.name}`)

	let data_size = pos_to - pos_from + 1
	if (!data_size || data_size < 0)
	    throw new Error('an attempt to write 0 bytes')

	if (data_size > this.free) return false

	this.free -= data_size
	file = dup(file)
	file.pos_from = pos_from
	file.pos_to = pos_to
	this.files.push(file)
	this._file_names_cache[file.name] = true
	return true
    }
}

exports.Disc = Disc

class DiscArray {
    constructor(disc_size) {
	this.disc_size = disc_size
	this.storage = []
	this.storage.push(new Disc(1, disc_size))
    }

    save(file, pos_from) {
	if (file.size <= this.disc_size) {
	    // try to find a free space for this file
	    for (let disc of this.storage) {
		if (disc.add(file)) return true
	    }
	    // all discs are filled w/ something, we need a new one
	    let d = new Disc(this.storage.length + 1, this.disc_size)
	    d.add(file)
	    this.storage.push(d)

	} else {
	    // the file is too big for the size of a single disc
	    let pos_from = pos_from || 0
	    let pos_to = -1
	    for (let disc of this.storage) {
		if (!disc.free) continue
		let pos_to = pos_from + disc.free - 1
		if (pos_to >= file.size) pos_to = file.size - 1
		disc.add_partial(file, pos_from, pos_to)
		pos_from = pos_to + 1
	    }

	    if (pos_to !== file.size - 1) {
		// an additional disc is requied
		// RECURSION!
		this.save(file, pos_from)
	    }
	}
    }
}

exports.DiscArray = DiscArray


let instructions = function(disc_size, data) {
    let da = new DiscArray(disc_size)
    for (let file of data_sort(data)) da.save(file)

    let r = []
    for (let disc in da.storage) {
	r.push(disc)
    }
    return r
}


if (process.argv[1] === __filename) {
    console.log(instructions(4.3, data(process.argv.slice(2))))
}
