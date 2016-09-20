'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
require('sinon-as-promised');

//Module to test
const Game = require('../../../src/model/Game.js');
const DB = require('../../../src/model/db');

describe('Game model', () => {
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

	it('should add a game', () => {
		return Game.addGame({
			Owner: userID,
			Name: 'Board1',
			Game: {
				gameDescription: 'A cool game'
			}
		}).should.eventually.contain(1);
	});
	
	it('should add a second game', () => {
		return Game.addGame({
			Owner: userID,
			Name: 'Boad1',
			Game: {
				gameDescription: 'A cool game'
			}
		}).then(() => Game.addGame({
			Owner: userID,
			Name: 'Board2',
			Game: {
				gameDescription: 'A wicked game'
			}
		})).should.eventually.contain(2);
	});

	it('should reject missing required fields', () => {
		return Game.addGame({}).should.be.rejectedWith(Error);
	});

	it('should find an existing board by ID', () => {
		return Game.addGame({
			Owner: userID,
			Name: 'Board1',
			Game: {
				gameDescription: 'a cool game'
			}
		}).then(() => Game.getGame(1)).should.eventually.contain.all({ID: 1});
	});

	it('should not find a non-existant board by ID', () => {
		return Game.getGame(0).should.eventually.equal(null);
	});
	
	describe('with threads', () => {
		let game;
		const Thread = require('../../../src/model/Thread.js');
		
		beforeEach(() => {
			return Game.addGame({
				Owner: userID,
				Name: 'Board1',
				Game: {
					gameDescription: 'A cool game'
				}
			}).then((ids) => Game.getGame(ids[0]))
			.then((oot) => {
				game = oot;
			});
		});
		
		it('Should return an array of threads', () => {
			return game.getThreads().should.eventually.be.an('Array');
		});
		
		it('Should start with no threads', () => {
			return game.getThreads().should.eventually.be.empty;
		});
		
		it('Should return threads that exist', () => {
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{ID: 1, Title: 'A Thread'}]);
			return game.getThreads().should.eventually.have.length(1);
		});
	});
});
