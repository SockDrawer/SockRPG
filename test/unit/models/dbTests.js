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
		sandbox = Sinon.sandbox.create();
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
			console.log('town down!');
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
	});
});
