'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');

//Module to test
const Board = require('../../../src/model/Board.js');
const Game = require('../../../src/model/Game.js');
const utils = require('../../../src/model/utils.js');
const DB = require('../../../src/model/db');

describe('utils', () => {
	let sandbox;

	beforeEach(() => {
		return Promise.resolve()
			.then(() => {
				sandbox = Sinon.createSandbox();
			})
			.then(() => DB.initialise({
				database: {
					filename: ':memory:'
				}
			}));
	});

	afterEach(() => {
		return Promise.resolve().then(() => DB.teardown())
			.then(() => {
				sandbox.restore();
			});
	});

	describe('getBoardOrGame()', () => {
		it('should get null on not found', () => {
			return utils.getBoardOrGame(42).should.eventually.equal(null);
		});
		it('should get a Board', () => {
			const board = new Board({
				Owner: -1,
				Name: 'Board1'
			});
			return Board.addBoard(board)
				.then(() => utils.getBoardOrGame(1))
				.then((result) => {
					result.should.be.instanceof(Board);
					result.should.not.be.instanceof(Game);
				});
		});
		it('should get a Game', () => {
			const game = new Game({
				Owner: -1,
				Name: 'Board1',
				Game: {
					gameDescription: 'a cool game'
				}
			});
			return Game.addGame(game)
				.then(() => utils.getBoardOrGame(1))
				.then((result) => {
					result.should.be.instanceof(Board);
					result.should.be.instanceof(Game);
				});
		});
	});
	describe('getBoardsAndGames(parent)', () => {
		beforeEach(() => Promise.all([
			Board.addBoard({
				Owner: -1,
				Name: 'Board1',
				ParentID: null
			}),
			Board.addBoard({
				Owner: -1,
				Name: 'Board2',
				ParentID: null
			}),
			Board.addBoard({
				Owner: -1,
				Name: 'SubBoard1',
				ParentID: 1
			}),
			Game.addGame({
				Owner: -1,
				Name: 'Game1',
				Game: {
					gameDescription: 'a cool game'
				},
				ParentID: null
			}),
			Game.addGame({
				Owner: -1,
				Name: 'Game2',
				Game: {
					gameDescription: 'a cool game'
				},
				ParentID: null
			}),
			Game.addGame({
				Owner: -1,
				Name: 'SubGame1',
				Game: {
					gameDescription: 'a cool game'
				},
				ParentID: 2
			}),
			Game.addGame({
				Owner: -1,
				Name: 'SubGame1',
				Game: {
					gameDescription: 'a cool game'
				},
				ParentID: 3
			}),
			Board.addBoard({
				Owner: -1,
				Name: 'SubBoard1',
				ParentID: 3
			})
		]));
		it('should get child Game', () => {
			return utils.getBoardsAndGames(2).then((results) => {
				results.should.have.length(1);
				results[0].should.be.instanceof(Game);
			});
		});
		it('should get child Board', () => {
			return utils.getBoardsAndGames(2).then((results) => {
				results.should.have.length(1);
				results[0].should.be.instanceof(Board);
			});
		});
		it('should get child Board and Game', () => {
			return utils.getBoardsAndGames(3).then((results) => {
				results.should.have.length(2);
				results[1].should.be.instanceof(Game);
				results[0].should.be.instanceof(Board);
			});
		});
		it('should get root Board and Game', () => {
			return utils.getBoardsAndGames(null).then((results) => {
				results.should.have.length(4);
				results.filter((row) => !(row instanceof Game)).should.have.length(2);
				results.filter((row) => row instanceof Game).should.have.length(2);
			});
		});
		it('should get root Board and Game (falsey parent)', () => {
			return utils.getBoardsAndGames(0).then((results) => {
				results.should.have.length(4);
				results.filter((row) => !(row instanceof Game)).should.have.length(2);
				results.filter((row) => row instanceof Game).should.have.length(2);
			});
		});
	});
});
