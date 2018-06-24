'use strict';

//Testing modules
const fs = require('fs');
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
require('sinon-as-promised');

//Module to test
const Post = require('../../../src/model/Post.js');
const DB = require('../../../src/model/db');


describe('DB model', () => {
	let sandbox;
    
	beforeEach(() => {
		return Promise.resolve().then(() => {
			sandbox = Sinon.sandbox.create();
		});
	});

	afterEach(() => {
		return Promise.resolve().then(() => DB.teardown())
		.then(() => {
			sandbox.restore();
		});
	});
	
	it('initialise should work', () => {
		return Promise.resolve().then(() => DB.initialise({
			database: {
				filename: ':memory:'
			}
		}))
		.then(() => {
			DB.isInitialised().should.equal(true);
		});
	});
	
	it('teardown should work', () => {
		return Promise.resolve().then(() => DB.initialise({
			database: {
				filename: ':memory:'
			}
		}))
		.then(() => {
			DB.isInitialised().should.equal(true);
		})
		.then(() => DB.teardown())
		.then(() => {
			DB.isInitialised().should.equal(false);
		});
	});
	
	it('redundant initialization should not error', () => {
		return Promise.resolve().then(() => DB.initialise({
			database: {
				filename: ':memory:'
			}
		}))
		.then(() => {
			DB.isInitialised().should.equal(true);
		})
		.then(() => DB.initialise({
			database: {
				filename: ':memory:'
			}
		}))
		.then(() => {
			DB.isInitialised().should.equal(true);
		});
	});
	
	it('a subsequent later initialization of the same database should work', () => {
		// This test (unfortunately) has to make use a of a temporary file and
		// Travis sometimes handles this very slow, such that a default 2000ms
		// timeout is exceeded! For this reason, at 60s timeout is set at the
		// end.
		
		return Promise.resolve().then(() => new Promise((resolve, reject) => {
			fs.unlink('tmpfile.sqlite', (_) => {
				return resolve();
			});
		}))
		.then(() => DB.initialise({
			database: {
				filename: 'tmpfile.sqlite'
			}
		}))
		.then(() => {
			DB.isInitialised().should.equal(true);
		})
		.then(() => DB.teardown())
		.then(() => {
			DB.isInitialised().should.equal(false);
		})
		.then(() => DB.initialise({
			database: {
				filename: 'tmpfile.sqlite'
			}
		}))
		.then(() => {
			DB.isInitialised().should.equal(true);
		})
		.then(() => DB.teardown())
		.then(() => {
			DB.isInitialised().should.equal(false);
		})
		.then(() => new Promise((resolve, reject) => {
			fs.unlink('tmpfile.sqlite', (_) => {
				return resolve();
			});
		}))
		.catch(() => new Promise((resolve, reject) => {
			fs.unlink('tmpfile.sqlite', (_) => {
				return resolve();
			});
		}));
	}).timeout(60000);
});
