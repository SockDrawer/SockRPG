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
const DB = require('../../../src/model/db');

describe('Board model', function() {
	let sandbox;
	this.timeout(5000);

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
	describe('static addBoard()', () => {
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

	describe('static getChildrenOf()', () => {
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
			return Board.getChildrenOf(2).then((results) => {
				results.should.have.length(1);
				results[0].should.be.instanceof(Game);
			});
		});
		it('should get child Board', () => {
			return Board.getChildrenOf(2).then((results) => {
				results.should.have.length(1);
				results[0].should.be.instanceof(Board);
			});
		});
		it('should get child Board and Game', () => {
			return Board.getChildrenOf(3).then((results) => {
				results.should.have.length(2);
				results[1].should.be.instanceof(Game);
				results[0].should.be.instanceof(Board);
			});
		});
		it('should get root Board and Game', () => {
			return Board.getChildrenOf(null).then((results) => {
				results.should.have.length(4);
				results.filter((row) => !(row instanceof Game)).should.have.length(2);
				results.filter((row) => row instanceof Game).should.have.length(2);
			});
		});
		it('should get root Board and Game (falsey parent)', () => {
			return Board.getChildrenOf(0).then((results) => {
				results.should.have.length(4);
				results.filter((row) => !(row instanceof Game)).should.have.length(2);
				results.filter((row) => row instanceof Game).should.have.length(2);
			});
		});
	});

	describe('static get()', () => {
		it('should get null on not found', () => {
			return Board.get(42).should.eventually.equal(null);
		});
		it('should get a Board', () => {
			const board = new Board({
				Owner: -1,
				Name: 'Board1'
			});
			return Board.addBoard(board)
				.then(() => Board.get(1))
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
				.then(() => Board.get(1))
				.then((result) => {
					result.should.be.instanceof(Board);
					result.should.be.instanceof(Game);
				});
		});
	});

	describe('static getAllBoards()', () => {
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
	});

	describe('Constructor', () => {
		it('should set data from rowdata', () => {
			const expected = {};
			const board = new Board(expected);
			board.data.should.equal(expected);
		});
		it('should type coerce ID', () => {
			const board = new Board({
				ID: '42'
			});
			board.data.ID.should.equal(42);
		});
		
		it('should type coerce ID', () => {
			const board1 = new Board({
				Adult: 0
			});
			board1.data.Adult.should.equal(false);
			const board2 = new Board({
				Adult: 'false'
			});
			board2.data.Adult.should.equal(true);
		});
	});

	describe('Getters and Setters', () => {
		const createIt = (mutator) => Promise.resolve()
			.then(() => Board.addBoard({
				Owner: userID,
				Name: 'Board1'
			}))
			.then(() => Board.get(1))
			.then((board) => {
				mutator(board);
				return board.save()
					.then(() => Board.get(1))
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

	describe('getParent()', () => {
		it('should get parent with parent ID set', () => {
			const board = new Board({
				Owner: userID,
				Name: 'Board1',
				ParentID: 42
			});
			const parent = {
				ID: 666
			};
			sandbox.stub(Board, 'get').resolves(parent);
			return board.getParent().then((result) => {
				result.should.equal(parent);
				Board.get.calledWith(42).should.be.true;
			});
		});
	
		it('should get parent with parent ID not set', () => {
			const board = new Board({
				Owner: userID,
				Name: 'Board1'
			});
			sandbox.stub(Board, 'get').rejects(new Error());
			return board.getParent().should.eventually.become(null);
		});
	});

	describe('setParent()', () => {
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
	});

	describe('getThreads()', () => {
		let board;
		const Thread = require('../../../src/model/Thread.js');

		beforeEach(() => {
			const boardObj = {
				Owner: userID,
				Name: 'Board1'
			};
			return Board.addBoard(boardObj)
				.then((ids) => Board.get(ids[0]))
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

	describe('getChildren()', () => {
		it('should get children boards and games', () => {
			const expected = [1, 2, 3];
			sandbox.stub(Board, 'getChildrenOf').resolves(expected);
			const board = new Board({
				Owner: userID,
				Name: 'Board1',
				ID: 1701
			});
			return board.getChildren().then((results) => {
				results.should.equal(expected);
				Board.getChildrenOf.calledWith(1701).should.be.true;
			});
		});
	});
});
