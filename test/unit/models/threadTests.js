'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
require('sinon-as-promised');

//Module to test
const Board = require('../../../src/model/Board.js');
const Thread = require('../../../src/model/Thread.js');
const DB = require('../../../src/model/db');

describe('Thread model', () => {
	let sandbox, parentID;
    
	beforeEach(() => {
		sandbox = Sinon.sandbox.create();
		return DB.initialise({
			client: 'sqlite3',
			connection: {
				filename: ':memory:'
			},
			useNullAsDefault: true
		}).then(() =>
			Board.addBoard({
				Owner: 1,
				Name: 'Board1'
			})
		).then((ids) => {
			parentID = ids[0];
		});
	});

	afterEach(() => {
		sandbox.restore();
		return DB.teardown();
	});
    
	it('should add a thread', () => {
		return Thread.addThread({
			Title: 'A Thread',
			Board: parentID
		}).should.eventually.contain(1);
	});
	
	it('should add a second thread', () => {
		return Thread.addThread({
			Title: 'Thread 1',
			Board: parentID
		}).then(() => Thread.addThread({
			Title: 'Thread 2',
			Board: parentID
		})).should.eventually.contain(2);
	});

	it('should reject missing required fields', () => {
		return Thread.addThread({}).should.be.rejectedWith(Error);
	});

	it('should find an existing thread by ID', () => {
		return Thread.addThread({
			Title: 'A Thread',
			Board: parentID
		}).then(() => Thread.getThread(1)).should.eventually.contain.all({ID: 1});
	});

	it('should not find a non-existant thread by ID', () => {
		return Thread.getThread(0).should.eventually.equal(null);
	});
	
	it('should find threads by parent board', () => {
		return Thread.addThread({
			Title: 'A Thread',
			Board: parentID
		}).then(() => Thread.getThreadsInBoard(parentID)).should.eventually.have.length(1);
	});
	
	it('should find all by parent board', () => {
		return Thread.addThread({
			Title: 'Thread 1',
			Board: parentID
		}).then(() => Thread.addThread({
			Title: 'Thread 2',
			Board: parentID
		})).then(() => Thread.getThreadsInBoard(parentID)).should.eventually.have.length(2);
	});
	
	it('should serialize', () => {
		const fakeThread = {
			ID: Math.random(),
			Title: 'some thread'
		};
		
		const expected = {
			Title: fakeThread.Title,
			Canonical: `/api/Thread/${fakeThread.ID}`,
			ID: fakeThread.ID
		};
		
		new Thread(fakeThread).serialize().should.deep.equal(expected);
	});
	
	it('should construct', () => {
		const fakeThread = {
			ID: Math.random(),
			Title: 'some thread'
		};
		
		const expected = {
			Title: fakeThread.Title,
			ID: fakeThread.ID
		};
		
		new Thread(fakeThread).data.should.deep.equal(expected);
		new Thread(fakeThread).Canonical.should.equal(`/api/Thread/${fakeThread.ID}`);
	});
});
