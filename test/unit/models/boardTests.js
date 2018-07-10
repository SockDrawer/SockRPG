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

describe('Board model', () => {
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

	const userID = 1;

	it('should add a board', () => {
		return Board.addBoard({
			Owner: userID,
			Name: 'Board1'
		}).should.eventually.contain(1);
	});

	it('should set ID on add', () => {
		const board = new Board({
			Owner: userID,
			Name: 'Board1'
		});
		return Board.addBoard(board).then(() => {
			board.ID.should.equal(1);
		});
	});

	it('should add a board object', () => {
		return Board.addBoard(new Board({
			Owner: userID,
			Name: 'Board1'
		})).should.eventually.contain(1);
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

	describe('static getBoards()', () => {
		it('should get boards and games', () => {
			const expected = [1, 2, 3];
			sandbox.stub(utils, 'getBoardsAndGames').resolves(expected);
			return Board.getBoards(1701).then((results) => {
				results.should.equal(expected);
				utils.getBoardsAndGames.calledWith(1701).should.be.true;
			});
		});
	});

	it('should find an existing board by ID', () => {
		const boardObj = {
			Owner: userID,
			Name: 'Board1'
		};
		return Board.addBoard(boardObj)
			.then(() => Board.getBoard(1))
			.should.eventually.contain.all({
				ID: 1
			});
	});

	it('should get all boards', () => {
		const makers = [
			Board.addBoard({
				Owner: userID,
				Name: 'Board1'
			}), Board.addBoard({
				Owner: userID,
				Name: 'Board2'
			})
		];
		return Promise.all(makers)
			.then(() => Board.getAllBoards())
			.then((boards) => {
				boards.should.have.length(2);
				boards.filter((board) => board.Name === 'Board1').should.have.length(1);
				boards.filter((board) => board.Name === 'Board2').should.have.length(1);
			});
	});

	it('should not find a non-existant board by ID', () => {
		return Board.getBoard(0).should.eventually.equal(null);
	});

	it('should get parent with parent ID set', () => {
		const board = new Board({
			Owner: userID,
			Name: 'Board1',
			ParentID: 42
		});
		const parent = {
			ID: 666
		};
		sandbox.stub(utils, 'getBoardOrGame').resolves(parent);
		return board.getParent().then((result) => {
			result.should.equal(parent);
			utils.getBoardOrGame.calledWith(42).should.be.true;
		});
	});

	it('should get parent with parent ID not set', () => {
		const board = new Board({
			Owner: userID,
			Name: 'Board1'
		});
		sandbox.stub(utils, 'getBoardOrGame').rejects(new Error());
		return board.getParent().should.eventually.become(null);
	});

	it('should set parent Board', () => {
		const board = new Board({
			Owner: userID,
			Name: 'Board1',
			ID: 1701
		});
		const parent = new Board({
			Owner: userID,
			Name: 'Board1',
			ID: 8472
		});
		sandbox.stub(board, 'save').resolves();
		return board.setParent(parent).then(() => {
			board.data.ParentID.should.equal(parent.ID);
			board.save.called.should.be.true;
		});
	});
	it('should set parent Game', () => {
		const board = new Board({
			Owner: userID,
			Name: 'Board1',
			ID: 1701
		});
		const parent = new Game({
			Owner: userID,
			Name: 'Board1',
			ID: 8472
		});
		sandbox.stub(board, 'save').resolves();
		return board.setParent(parent).then(() => {
			board.data.ParentID.should.equal(parent.ID);
			board.save.called.should.be.true;
		});
	});

	it('should reject non board parent ', () => {
		const board = new Board({
			Owner: userID,
			Name: 'Board1',
			ID: 1701
		});
		return board.setParent('hi there!').should.eventually.be.rejectedWith('Parent must be a Board');
	});

	it('should accept Null parent ', () => {
		const board = new Board({
			Owner: userID,
			Name: 'Board1',
			ID: 1701
		});
		return board.setParent(null).then(() => {
			chai.expect(board.data.ParentID).to.equal(null);
		});
	});

	it('should get children boards and games', () => {
		const expected = [1, 2, 3];
		sandbox.stub(utils, 'getBoardsAndGames').resolves(expected);
		const board = new Board({
			Owner: userID,
			Name: 'Board1',
			ID: 1701
		});
		return board.getChildren().then((results) => {
			results.should.equal(expected);
			utils.getBoardsAndGames.calledWith(1701).should.be.true;
		});
	});

	describe('Getters and Setters', () => {
		const createIt = (mutator) => Promise.resolve()
			.then(() => Board.addBoard({
				Owner: userID,
				Name: 'Board1'
			}))
			.then(() => Board.getBoard(1))
			.then((board) => {
				mutator(board);
				return board.save()
					.then(() => Board.getBoard(1))
					.then((afterboard) => [board, afterboard]);
			});

		it('should set owner', () => {
			const expected = 5 + Math.floor(Math.random() * 1000);
			const mutex = (board) => {
				board.Owner = expected;
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
			const mutex = (board) => {
				board.Name = expected;
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
			const mutex = (board) => {
				board.Description = expected;
			};
			return createIt(mutex)
				.then(([beforeBoard, afterBoard]) => {
					beforeBoard.should.not.equal(afterBoard);
					beforeBoard.data.should.deep.equal(afterBoard.data);
					afterBoard.Description.should.equal(expected);
				});
		});

		it('should set adult mode on', () => {
			const mutex = (board) => {
				board.Adult = true;
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
			const boardObj = {
				Owner: userID,
				Name: 'Board1'
			};
			return Board.addBoard(boardObj)
				.then((ids) => Board.getBoard(ids[0]))
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
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{
				ID: 1,
				Title: 'A Thread'
			}]);
			return board.getThreads().should.eventually.have.length(1);
		});

		it('Should return only the thread IDs', () => {
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{
				ID: 1,
				Title: 'A Thread'
			}]);
			return board.getThreads().should.eventually.deep.equal([1]);
		});
	});
});
