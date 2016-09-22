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
const DB = require('../../../src/model/db');

describe('Board model', () => {
	let sandbox;
    
	beforeEach(() => {
		sandbox = Sinon.sandbox.create();
		return DB.initialise({
			client: 'sqlite3',
			connection: {
				filename: ':memory:'
			},
			useNullAsDefault: true
		});
	});

	afterEach(() => {
		sandbox.restore();
		return DB.teardown();
	});
    
	const userID = 1;

	it('should add a board', () => {
		return Board.addBoard({
			Owner: userID,
			Name: 'Board1'
		}).should.eventually.contain(1);
	});
	
	it('should add a second board', () => {
		return Board.addBoard({
			Owner: userID,
			Name: 'Boad1'
		}).then(() => Board.addBoard({
			Owner: userID,
			Name: 'Board2'
		})).should.eventually.contain(2);
	});

	it('should reject missing required fields', () => {
		return Board.addBoard({}).should.be.rejectedWith(Error);
	});

	it('should find an existing board by ID', () => {
		return Board.addBoard({
			Owner: userID,
			Name: 'Board1'
		}).then(() => Board.getBoard(1)).should.eventually.contain.all({ID: 1});
	});

	it('should not find a non-existant board by ID', () => {
		return Board.getBoard(0).should.eventually.equal(null);
	});

	describe('that are really Games', () => {
		it('should not add a board with a game ID', () => {
			return Board.addBoard({
				Name: 'GameByID',
				GameID: 1
			}).should.be.rejectedWith(Error);
		});

		it('should not add a board with a game object', () => {
			return Board.addBoard({
				Name: 'GameByObject',
				Game: {}
			}).should.be.rejectedWith(Error);
		});
	});
	
	describe('with threads', () => {
		let board;
		const Thread = require('../../../src/model/Thread.js');
		
		beforeEach(() => {
			return Board.addBoard({
				Owner: userID,
				Name: 'Board1'
			}).then((ids) => Board.getBoard(ids[0]))
			.then((oot) => {
				board = oot;
			});
		});
		
		it('Should return an array of threads', () => {
			return board.getThreads().should.eventually.be.an('Array');
		});
		
		it('Should start with no threads', () => {
			return board.getThreads().should.eventually.be.empty;
		});
		
		it('Should return threads that exist', () => {
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{ID: 1, Title: 'A Thread'}]);
			return board.getThreads().should.eventually.have.length(1);
		});
		
		it('Should return only the thread IDs', () => {
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{ID: 1, Title: 'A Thread'}]);
			return board.getThreads().should.eventually.deep.equal([1]);
		});
	});
});
