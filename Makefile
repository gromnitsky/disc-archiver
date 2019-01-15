.PHONY: test
test: node_modules
	mocha -u tdd test/test_*.js $(TEST_OPT)

node_modules: package.json
	npm i
	touch $@
