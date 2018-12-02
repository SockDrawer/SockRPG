'use strict';

//Testing modules
const fs = require('fs');
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');

//Module to test
//const Post = require('../../../src/model/Post.js'); // Currently unused.... delete?
const DB = require('../../../src/model/db');


describe('DB model', () => {
	let sandbox;

	beforeEach(() => {
		return Promise.resolve().then(() => {
			sandbox = Sinon.createSandbox();
		});
	});

	afterEach(() => {
		return Promise.resolve().then(() => DB.teardown())
		.then(() => {
			sandbox.restore();
		});
	});

	it('should allow get/set of knex object', () => {
		const expected = {};
		const knex = DB.knex;
		expected.should.not.equal(knex);
		DB.knex = expected;
		const actual = DB.knex;
		expected.should.equal(actual);
		DB.knex = knex;
	});

	it('initialise should work', () => {
		return Promise.resolve().then(() => DB.initialise())
		.then(() => {
			DB.isInitialised().should.equal(true);
		});
	});

	it('teardown should work', () => {
		return Promise.resolve().then(() => DB.initialise())
		.then(() => {
			DB.isInitialised().should.equal(true);
		})
		.then(() => DB.teardown())
		.then(() => {
			DB.isInitialised().should.equal(false);
		});
	});

	it('redundant initialization should not error', () => {
		return Promise.resolve().then(() => DB.initialise())
		.then(() => {
			DB.isInitialised().should.equal(true);
		})
		.then(() => DB.initialise())
		.then(() => {
			DB.isInitialised().should.equal(true);
		});
	});

	it('a subsequent later initialization of the same database should work', () => {
		// This test (unfortunately) has to make use a of a temporary file and
		// Travis sometimes handles this very slow, such that a default 2000ms
		// timeout is exceeded! For this reason, at 60s timeout is set at the
		// end.

		return Promise.resolve().then(() => new Promise((resolve) => {
			fs.unlink('tmpfile.sqlite', (_) => {
				return resolve();
			});
		}))
		.then(() => DB.initialise({
			connection: {
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
			connection: {
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
		.then(() => new Promise((resolve) => {
			fs.unlink('tmpfile.sqlite', (_) => {
				return resolve();
			});
		}))
		.catch(() => new Promise((resolve) => {
			fs.unlink('tmpfile.sqlite', (_) => {
				return resolve();
			});
		}));
	}).timeout(60000);
});
