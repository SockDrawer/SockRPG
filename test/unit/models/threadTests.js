'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');

//Module to test
const Board = require('../../../src/model/Board.js');
const Thread = require('../../../src/model/Thread.js');
const DB = require('../../../src/model/db');

describe('Thread model', () => {
	let sandbox, parentID;

	beforeEach(() => {
		return Promise.resolve().then(() => {
			sandbox = Sinon.createSandbox();
		})
		.then(() => DB.initialise({
			database: {
				filename: ':memory:'
			}
		})).then(() =>
			Board.addBoard({
				Owner: 1,
				Name: 'Board1'
			})
		).then((ids) => {
			parentID = ids[0];
		});
	});

	afterEach(() => {
		return Promise.resolve().then(() => DB.teardown())
		.then(() => {
			sandbox.restore();
		});
	});

	it('should add a thread', () => {
		return Thread.addThread({
			Title: 'A Thread',
			Board: parentID
		}).should.eventually.contain(1);
	});

	it('should add a thread object', () => {
		return Thread.addThread(new Thread({
			Title: 'A Thread',
			Board: parentID
		})).should.eventually.contain(1);
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

	it('should save and retrieve thread', () => {
		const thread = new Thread({
			Title: `A Thread ${Math.random()}`,
			Board: parentID
		});
		let ID = undefined;
		return Thread.addThread(thread)
			.then((id) => {
				ID = id[0];
				return Thread.getThread(ID);
			})
			.then((dbthread) => {
				thread.Title.should.equal(dbthread.Title);
				dbthread.ID.should.equal(ID);
			});
	});

	it('should update thread', () => {
		let thread = new Thread({
			Title: `A Thread ${Math.random()}`,
			Board: parentID
		});
		let ID = undefined;
		return Thread.addThread(thread)
			.then((id) => {
				ID = id[0];
				return Thread.getThread(ID);
			})
			.then((dbthread) => {
				thread = dbthread;
				thread.Title = `Awesome new Title ${Math.random()}`;
				return thread.save();
			})
			.then(() => Thread.getThread(ID))
			.then((dbthread) => {
				thread.data.should.deep.equal(dbthread.data);
			});
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
			Canonical: `/api/threads/${fakeThread.ID}`,
			ID: fakeThread.ID
		};

		new Thread(fakeThread).serialize().should.deep.equal(expected);
	});

	it('should set thread title', () => {
		const expected = `title ${Math.random()}`;
		const thred = new Thread({
			Title: expected,
			Board: parentID
		});
		thred.Title.should.equal(expected);
	});

	it('should update thread title', () => {
		const expected = `title ${Math.random()}`;
		const thred = new Thread({
			Title: 'not correct',
			Board: parentID
		});
		thred.Title = expected;
		thred.data.Title.should.equal(expected);
	});

	it('should construct', () => {
		const fakeThread = {
			ID: Math.random(),
			Board: Math.random(),
			Title: 'some thread'
		};

		const expected = {
			Title: fakeThread.Title,
			ID: fakeThread.ID,
			Board: fakeThread.Board
		};

		new Thread(fakeThread).data.should.deep.equal(expected);
		new Thread(fakeThread).Canonical.should.equal(`/api/threads/${fakeThread.ID}`);
	});
});
