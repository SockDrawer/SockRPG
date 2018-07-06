'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');

//Module to test
const Board = require('../../../src/model/Board.js');
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
