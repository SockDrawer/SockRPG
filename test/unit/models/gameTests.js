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
			database: {
				filename: ':memory:'
			}
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
	
	it('should expose owner as GM', () => {
		return Game.addGame({
			Owner: userID,
			Name: 'Board1',
			Game: {
				gameDescription: 'a cool game'
			}
		}).then(() => Game.getGame(1)).should.eventually.contain.all({gameMaster: userID});
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
	
	describe('with tags', () => {
		let game;
		
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
		
		it('Should return an array of tags', () => {
			return game.getTags().should.eventually.be.an('Array');
		});
		
		it('Should start with no tags', () => {
			return game.getTags().should.eventually.be.empty;
		});
		
		it('Should add a tag', () => {
			return game.addTag('banana').should.resolve;
		});
		
		it('Should retrieve added tags', () => {
			return game.addTag('kitten').then(() => {
				return game.getTags().should.eventually.contain('kitten');
			});
		});
		
		it('Should remove tags', () => {
			return DB.knex('Tags').insert([{
				GameID: game.GameID,
				Tag: 'kitten'
			}, {
				GameID: game.GameID,
				Tag: 'puppy'
			}])
			.then(() => game.removeTag('kitten'))
			.then(() => game.getTags().should.eventually.contain['puppy'])
			.then(() => game.getTags().should.eventually.not.contain['kitten']);
		});
	});
});
