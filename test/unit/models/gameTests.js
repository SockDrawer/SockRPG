'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');

//Module to test
const Game = require('../../../src/model/Game.js');
const Board = require('../../../src/model/Board.js');
const DB = require('../../../src/model/db');

describe('Game model', () => {
	let sandbox;

	beforeEach(() => {
		return Promise.resolve()
			.then(() => {
				sandbox = Sinon.createSandbox();
			})
			.then(() => DB.initialise({
				database: {
					client: 'sqlite3',
					connection: {
						filename: ':memory:'
					},
					useNullAsDefault: true
				}
			}));
	});

	afterEach(() => {
		return Promise.resolve().then(() => DB.teardown())
			.then(() => {
				sandbox.restore();
			});
	});

	const userID = 1;

	describe('static addGame()', () => {
		it('should add a game', () => {
			return Game.addGame({
				Owner: userID,
				Name: 'Board1',
				Game: {
					gameDescription: 'A cool game'
				}
			}).should.eventually.contain(1);
		});
		it('should add a game object', () => {
			return Game.addGame(new Game({
				Owner: userID,
				Name: 'Board1',
				Game: {
					gameDescription: 'A cool game'
				}
			})).should.eventually.contain(1);
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

		it('should reject plain Board', () => {
			return Game.addGame(new Board({})).should.be.rejectedWith(Error);
		});

		it('should reject missing required Name', () => {
			return Game.addGame({
				Game: {}
			}).should.be.rejectedWith(Error);
		});
	});

	describe('static get()', () => {
		it('should find an existing board by ID', () => {
			const data = {
				Owner: userID,
				Name: 'Board1',
				Game: {
					gameDescription: 'a cool game'
				}
			};
			return Game.addGame(data)
				.then(() => Game.get(1)).should.eventually.contain.all({
					ID: 1
				});
		});

		it('should not find a non-existant board by ID', () => {
			return Game.get(0).should.eventually.equal(null);
		});
	});

	describe('static getAllGames()', () => {
		it('should get all games', () => {
			const makers = [
				Game.addGame({
					Owner: userID,
					Name: 'Board1',
					Game: {
						gameDescription: 'a cool game'
					}
				}), Game.addGame({
					Owner: userID,
					Name: 'Board2',
					Game: {
						gameDescription: 'a cool game'
					}
				})
			];
			return Promise.all(makers)
				.then(() => Game.getAllGames())
				.then((games) => {
					games.should.have.length(2);
					games.filter((game) => game.Name === 'Board1').should.have.length(1);
					games.filter((game) => game.Name === 'Board2').should.have.length(1);
				});
		});
	});

	describe('static getAllBoards()', () => {
		it('should get all as boards', () => {
			const makers = [
				Game.addGame({
					Owner: userID,
					Name: 'Board1',
					Game: {
						gameDescription: 'a cool game'
					}
				}), Game.addGame({
					Owner: userID,
					Name: 'Board2',
					Game: {
						gameDescription: 'a cool game'
					}
				})
			];
			return Promise.all(makers)
				.then(() => Board.getAllBoards())
				.then((games) => {
					games.should.have.length(2);
					games.filter((game) => game.Name === 'Board1').should.have.length(1);
					games.filter((game) => game.Name === 'Board2').should.have.length(1);
				});
		});
	});

	describe('getThreads()', () => {
		let game;
		const Thread = require('../../../src/model/Thread.js');

		beforeEach(() => {
			const data = {
				Owner: userID,
				Name: 'Board1',
				Game: {
					gameDescription: 'A cool game'
				}
			};
			return Game.addGame(data)
				.then((ids) => Game.get(ids[0]))
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
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{
				ID: 1,
				Title: 'A Thread'
			}]);
			return game.getThreads().should.eventually.have.length(1);
		});
	});

	describe('Getters and Setters', () => {
		const createIt = (mutator) => Promise.resolve()
			.then(() => Game.addGame({
				Owner: userID,
				Name: 'Board1',
				Game: {
					gameDescription: 'A wicked game'
				}
			}))
			.then(() => Game.get(1))
			.then((game) => {
				mutator(game);
				return game.save()
					.then(() => Game.get(1))
					.then((afterGame) => [game, afterGame]);
			});

		it('should set owner', () => {
			const expected = 5 + Math.floor(Math.random() * 1000);
			const mutex = (game) => {
				game.Owner = expected;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Owner.should.equal(expected);
				});
		});

		it('should set name', () => {
			const expected = `foobar and the ${Math.floor(Math.random() * 1000)} bears`;
			const mutex = (game) => {
				game.Name = expected;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Name.should.equal(expected);
				});
		});

		it('should set description', () => {
			const expected = `foobar and the ${Math.floor(Math.random() * 1000)} bears`;
			const mutex = (game) => {
				game.Description = expected;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Description.should.equal(expected);
				});
		});

		it('should set gameDescription', () => {
			const expected = `foobar and the ${Math.floor(Math.random() * 1000)} bears`;
			const mutex = (game) => {
				game.description = expected;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.description.should.equal(expected);
				});
		});

		it('should set adult mode on', () => {
			const mutex = (game) => {
				game.Adult = true;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Adult.should.equal(true);
				});
		});

		it('should set adult mode on (truthy)', () => {
			const mutex = (board) => {
				board.Adult = 'false';
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Adult.should.equal(true);
				});
		});

		it('should set adult mode off', () => {
			const mutex = (board) => {
				board.Adult = false;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Adult.should.equal(false);
				});
		});

		it('should set adult mode off (falsy)', () => {
			const mutex = (board) => {
				board.Adult = 0;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Adult.should.equal(false);
				});
		});
	});

});
