'use strict';

//Testing modules
const sinon = require('sinon'),
	chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

//Module to test
const db = require('../../../src/model/db.js');

//Test data
const tables = ['Users', 'Boards', 'Games'];

describe('DB', () => {
	let sandbox;

	before(() => {
	});

	beforeEach(() => {
		sandbox = sinon.sandbox;
	});

	afterEach(() => {
		sandbox.restore();
	});

	after(() => {
	});

	describe('should export management function', () => {
		const fns = ['initialise', 'close'];
		fns.forEach((fn) => {
			it(fn, () => expect(db[fn]).to.be.a('function'));
		});
	});

	describe('invalid configuration', () => {
		it('should reject no config', () => {
			return db.initialise().should.be.rejectedWith(Error);
		});

		it('should reject empty config', () => {
			return db.initialise({}).should.be.rejectedWith(Error);
		});

		it('should reject multi-db config', () => {
			return db.initialise({
				sqlite: {},
				postgres: {}
			}).should.be.rejectedWith(Error);
		});

		describe('SQLite', () => {
			it('should reject non-string location', () => {
				return db.initialise({
					sqlite: {}
				}).should.be.rejectedWith(Error);
			});
		});

		describe('PostgreSQL', () => {
			it('should reject non-string host', () => {
				return db.initialise({
					postgres: {
						host: {},
						name: '',
						username: '',
						password: ''
					}
				}).should.be.rejectedWith(Error);
			});

			it('should reject non-string name', () => {
				return db.initialise({
					postgres: {
						host: '',
						name: {},
						username: '',
						password: ''
					}
				}).should.be.rejectedWith(Error);
			});

			it('should reject non-string username', () => {
				return db.initialise({
					postgres: {
						host: '',
						name: '',
						username: {},
						password: ''
					}
				}).should.be.rejectedWith(Error);
			});

			it('should reject non-string password', () => {
				return db.initialise({
					postgres: {
						host: '',
						name: '',
						username: '',
						password: {}
					}
				}).should.be.rejectedWith(Error);
			});
		});
	});

	describe('SQLite', () => {
		it('should create the database', () => {
			return db.initialise({
				sqlite: ':memory:'
			}).should.be.fulfilled;
		});

		tables.forEach((table) => {
			it(`should export the ${table} table`, () => {
				return expect(Promise.resolve(db[table])).to.eventually.be.an('object');
			});
		});

		it('should close the database', () => {
			return db.close().should.be.fulfilled;
		});

		tables.forEach((table) => {
			it(`should no longer export the ${table} table`, () => {
				return expect(Promise.resolve(db[table])).to.eventually.be.undefined;
			});
		});
	});

	describe('PostgreSQL', () => {
		it('should create the database', () => {
			return db.initialise({
				postgres: {
					host: 'localhost',
					name: 'SockRPG',
					username: 'sockrpg',
					password: '2067e4eb'
				}
			}).should.be.fulfilled;
		});

		tables.forEach((table) => {
			it(`should export the ${table} table`, () => {
				return expect(Promise.resolve(db[table])).to.eventually.be.an('object');
			});
		});

		it('should close the database', () => {
			return db.close().should.be.fulfilled;
		});

		tables.forEach((table) => {
			it(`should no longer export the ${table} table`, () => {
				return expect(Promise.resolve(db[table])).to.eventually.be.undefined;
			});
		});
	});
});
