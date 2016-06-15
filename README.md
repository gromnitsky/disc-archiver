# disc-archiver

Calculates the exact minimum amount of required discs for the set of
files. Generates a makefile that splits those files & produces correct
iso images.

## Why?

Suppose you've backed up a Linux/BSD machine using dump(8) or tar or
whatever. Say you've ended up w/ 3 files:

* `boot.dump.aes`, 1GB
* `home.dump.aes`, 20GB
* `root.dump.eas`, 40GB

& you have several BD-RE dics, every one of which can hold ~25GB. How
would you fit those 3 files on the discs? `boot.dump.aes` &
`home.dump.aes` can safely go to the 1st one, but `root.dump.eas`
requires splitting.

This is when disc-archiver comes in. It automatially calculates where
each file goes, how it should be splitted, etc.


## Example

For the convolutedness sake, we'll use an imaginary scale, where 1 byte ==
1GB.

```
$ ls -l
total 3K
-rw-r--r-- 1 alex users  1 Jun 15 01:16 boot.dump.aes
-rw-r--r-- 1 alex users 20 Jun 15 01:16 home.dump.aes
-rw-r--r-- 1 alex users 40 Jun 15 01:16 root.dump.aes
```

Running `disc-archiver-calc` produces a set of instructions "how the
files _may_ be placed on the discs" (it doens't write/copy anything):

```
$ disc-archiver-calc 25 *aes
1       boot.dump.aes
1       home.dump.aes
1       root.dump.aes   0       3
2       root.dump.aes   4       28
3       root.dump.aes   29      39
```

The 1st column represents a disc number. The 3rd & 4th are byte ranges
_from_ & _to_. Here, `root.dump.aes` should be splitted in 3 chunks
where each of the chunk would go to a separate disc.

`disc-archiver-gt` reads these instructions & generates a makefile:

```
$ disc-archiver-calc 25 *aes | disc-archiver-gt > Makefile

$ cat Makefile
# Auto-generated by disc-archiver-gt, don't edit.
# Run `make` to create .iso files.

.PHONY: compile
compile:

out/iso/1.iso: out/src/1/boot.dump.aes \
	out/src/1/home.dump.aes \
	out/src/1/root.dump.aes.part-1-of-3
	@mkdir -p $(dir $@)
	genisoimage -rJ -input-charset utf-8 $(ISO_OPT) -o $@ $(dir $<)
out/iso/2.iso: out/src/2/root.dump.aes.part-2-of-3
	@mkdir -p $(dir $@)
	genisoimage -rJ -input-charset utf-8 $(ISO_OPT) -o $@ $(dir $<)
out/iso/3.iso: out/src/3/root.dump.aes.part-3-of-3
	@mkdir -p $(dir $@)
	genisoimage -rJ -input-charset utf-8 $(ISO_OPT) -o $@ $(dir $<)

compile: out/iso/1.iso \
	out/iso/2.iso \
	out/iso/3.iso

out/src/1/boot.dump.aes: boot.dump.aes
	@mkdir -p $(dir $@)
	cp $< $@
out/src/1/home.dump.aes: home.dump.aes
	@mkdir -p $(dir $@)
	cp $< $@
out/src/1/root.dump.aes.part-1-of-3: root.dump.aes
	@mkdir -p $(dir $@)
	dd if=$< of=$@ bs=64K iflag=skip_bytes,count_bytes skip=0 count=4
out/src/2/root.dump.aes.part-2-of-3: root.dump.aes
	@mkdir -p $(dir $@)
	dd if=$< of=$@ bs=64K iflag=skip_bytes,count_bytes skip=4 count=25
out/src/3/root.dump.aes.part-3-of-3: root.dump.aes
	@mkdir -p $(dir $@)
	dd if=$< of=$@ bs=64K iflag=skip_bytes,count_bytes skip=29 count=11
```

If we indeed run the Makefile, we'll get 3 iso images in `out/iso`
directory:

```
$ make
[...]

$ ls -l out/iso/
total 1100K
-rw-r--r-- 1 alex users 380928 Jun 15 01:37 1.iso
-rw-r--r-- 1 alex users 372736 Jun 15 01:37 2.iso
-rw-r--r-- 1 alex users 372736 Jun 15 01:37 3.iso
```

We can also check that `root.dump.aes` was splitted correctly:

```
$ cat out/src/[0-9]/root* > omglol
$ sha256sum omglol root.dump.aes
847baa6daf2ab6cac62d59e771ff3b5ae4cff17915038f1e6c8cad27cc55462e  omglol
847baa6daf2ab6cac62d59e771ff3b5ae4cff17915038f1e6c8cad27cc55462e  root.dump.aes
```


## Installation

1. Clone the repo.
2. `cd $repo && make`
3. Symlink `disc-archiver-*` to a dir in the PATH.


## Bugs

* As it uses GNU Make, files names w/ spaces aren't allowed.

* It takes 3 times more disk space to create all this rigmarole
  (splitted/copied files in `out/src` + .iso in `out/iso`).


## License

MIT.