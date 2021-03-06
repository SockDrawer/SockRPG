'use strict';
const Path = require('path');
const Chai = require('chai');
const assert = Chai.assert;
const Sinon = require('sinon');

//controllers
const userController = require(Path.resolve(__dirname, '../../../src/controllers/userController.js'));
const boardController = require(Path.resolve(__dirname, '../../../src/controllers/boardController.js'));
const gameController = require(Path.resolve(__dirname, '../../../src/controllers/boardController.js'));

//models
const Game = require('../../../src/model/Game');
const Board = require('../../../src/model/Board');
const User = require('../../../src/model/User');
const Thread = require('../../../src/model/Thread');


describe('Game API controller', () => {
	let sandbox;

	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
	});

	afterEach( () => {
		sandbox.restore();
	});

	describe('/api/games', () => {
		it('should return a list of games', () => {
			const data = [{
				ID: '1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}, {
				ID: '2',
				Name: 'test game 2',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}];

			sandbox.stub(Game, 'getAllGames').resolves(data);
			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					data[0].canonical = '/game/1';
					data[1].canonical = '/game/2';
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return gameController.getAllGames(undefined, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'oops i asploded'
			};

			sandbox.stub(Game, 'getAllGames').rejects('oops i asploded');

			const mockResponse = {
				status: (code) => {
					assert.equal(500, code, 'Should return a 500 error');
					return mockResponse;
				}, send: (response) => {
					assert.ok(response);
					assert.deepEqual(expected, response);
					return mockResponse;
				}
			};

			return gameController.getAllGames(undefined, mockResponse);
		});
	});

	describe('/api/boards', () => {
		it('should return a list of boards', () => {
			const data = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				Tags: [],
				IC: null
			}, {
				ID: '2',
				Name: 'test board 2',
				Adult: false,
				Tags: [],
				IC: null
			}];

			sandbox.stub(Board, 'getAllBoards').resolves(data);
			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					data[0].canonical = '/board/1';
					data[1].canonical = '/board/2';
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return boardController.getAllBoards(undefined, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'oops i asploded'
			};

			sandbox.stub(Board, 'getAllBoards').rejects('oops i asploded');

			const mockResponse = {
				status: (code) => {
					assert.equal(500, code, 'Should return a 500 error');
					return mockResponse;
				},
				send: (response) => {
					assert.ok(response);
					assert.deepEqual(expected, response);
					return mockResponse;
				}
			};

			return boardController.getAllBoards(undefined, mockResponse);
		});
	});

	describe('/api/game/{ID}', () => {
		it('should return a game if one exists', () => {
			const data = {
				ID: '1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null,
				Game: {
					ID: 2,
					gameDescription: 'A cool game'
				},
				threadList: []
			};

			sandbox.stub(Board, 'get').resolves(new Game(data));
			sandbox.stub(Thread, 'getThreadsInBoard').resolves();

			const mockRequest = {
				params: {
					id: 1
				}
			};

			let actualResponse = null;
			let actualCode = null;
			const mockResponse = {
				status: (code) => {
					actualCode = code;
					return mockResponse;
				},
				send: (response) => {
					actualResponse = response;
					return mockResponse;
				}
			};

			return gameController.getGame(mockRequest, mockResponse).then(() => {
				data.Canonical = '/api/games/1';
				assert.deepEqual(data, actualResponse);
				assert.isTrue(Thread.getThreadsInBoard.called);
				assert.equal(200, actualCode, 'Should return a 200 ok if anything');
			});
		});

		it('should return threads if they exist', () => {
			const data = {
				ID: '1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null,
				Game: {
					ID: 2,
					gameDescription: 'A cool game'
				}
			};

			sandbox.stub(Game, 'get').resolves(new Game(data));
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{ID: 1}, {ID: 2}, {ID: 3}]);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			let actualResponse = null;
			let actualCode = null;
			const mockResponse = {
				status: (code) => {
					actualCode = code;
					return mockResponse;
				},
				send: (response) => {
					actualResponse = response;
					return mockResponse;
				}
			};

			return gameController.getGame(mockRequest, mockResponse).then(() => {
				assert.isTrue(Thread.getThreadsInBoard.called);
				assert.deepEqual(actualResponse.threadList, [1, 2, 3]);
				assert.equal(200, actualCode, 'Should return a 200 ok if anything');
			});
		});

		it('should return a 404 if no game exists', () => {
			sandbox.stub(Game, 'get').resolves(undefined);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(404, code, 'Should return a 404 if anything');
					return mockResponse;
				},
				send: () => {
					assert.notOk(true, 'Should not send data');
					return mockResponse;
				},
				end: () => {}
			};

			return gameController.getGame(mockRequest, mockResponse);
		});

		it('should return a 400 if no ID passed in', () => {
			sandbox.stub(Game, 'get').resolves(undefined);

			const mockRequest = {
				params: {
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(400, code, 'Should return a 400');
					return mockResponse;
				},
				send: (response) => {
					assert.deepEqual(response, {error: 'Missing ID'});
					return mockResponse;
				}
			};

			return gameController.getGame(mockRequest, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'oops i asploded'
			};

			sandbox.stub(Game, 'get').rejects('oops i asploded');

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(500, code, 'Should return a 500 error');
					return mockResponse;
				},
				send: (response) => {
					assert.ok(response);
					assert.deepEqual(expected, response);
					return mockResponse;
				}
			};

			return gameController.getGame(mockRequest, mockResponse);
		});
	});

	describe('/api/board/{ID}', () => {
		it('should return a board if one exists', () => {
			const data = {
				ID: '1',
				Name: 'test board',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null,
				threadList: []
			};

			sandbox.stub(Board, 'get').resolves(new Board(data));
			sandbox.stub(Thread, 'getThreadsInBoard').resolves();

			const mockRequest = {
				params: {
					id: 1
				}
			};

			let actualResponse = null;
			let actualCode = null;
			const mockResponse = {
				status: (code) => {
					actualCode = code;
					return mockResponse;
				},
				send: (response) => {
					actualResponse = response;
					return mockResponse;
				}
			};

			return boardController.getBoard(mockRequest, mockResponse).then(() => {
				assert.equal(200, actualCode, 'Should return a 200 ok if anything');
				data.Canonical = '/api/boards/1';
				assert.isTrue(Thread.getThreadsInBoard.called);
				assert.deepEqual(data, actualResponse);
			});
		});

		it('should return a board if one exists', () => {
			const data = {
				ID: '1',
				Name: 'test board',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			sandbox.stub(Board, 'get').resolves(new Board(data));
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([{ID: 1}, {ID: 2}, {ID: 3}]);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			let actualResponse = null;
			let actualCode = null;
			const mockResponse = {
				status: (code) => {
					actualCode = code;
					return mockResponse;
				},
				send: (response) => {
					actualResponse = response;
					return mockResponse;
				}
			};

			return gameController.getBoard(mockRequest, mockResponse).then(() => {
				assert.isTrue(Thread.getThreadsInBoard.called);
				assert.deepEqual(actualResponse.threadList, [1, 2, 3]);
				assert.equal(200, actualCode, 'Should return a 200 ok if anything');
			});
		});

		it('should return a 404 if no board exists', () => {
			sandbox.stub(Board, 'get').resolves(undefined);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(404, code, 'Should return a 404 if anything');
					return mockResponse;
				},
				send: () => {
					assert.notOk(true, 'Should not send data');
					return mockResponse;
				},
				end: () => {}
			};

			return boardController.getBoard(mockRequest, mockResponse);
		});

		it('should return a 400 if no ID passed in', () => {
			sandbox.stub(Board, 'get').resolves(undefined);

			const mockRequest = {
				params: {
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(400, code, 'Should return a 400');
					return mockResponse;
				},
				send: (response) => {
					assert.deepEqual(response, {error: 'Missing ID'});
					return mockResponse;
				}
			};

			return boardController.getBoard(mockRequest, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'oops i asploded'
			};

			sandbox.stub(Board, 'get').rejects('oops i asploded');

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(500, code, 'Should return a 500 error');
					return mockResponse;
				},
				send: (response) => {
					assert.ok(response);
					assert.deepEqual(expected, response);
					return mockResponse;
				}
			};

			return boardController.getBoard(mockRequest, mockResponse);
		});
	});
});

describe('User API Controller', () => {
	let sandbox;

	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
	});

	afterEach( () => {
		sandbox.restore();
	});

	describe('/api/users', () => {
		it('should return a list of users', () => {
			const data = [{
				ID: '1',
				Admin: false,
				Username: 'user1'
			}, {
				ID: '2',
				Admin: false,
				Username: 'user2'
			}];

			sandbox.stub(User, 'getAllUsers').resolves(data);
			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return userController.getAllUsers(undefined, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'oops i asploded'
			};

			sandbox.stub(User, 'getAllUsers').rejects('oops i asploded');

			const mockResponse = {
				status: (code) => {
					assert.equal(500, code, 'Should return a 500 error');
					return mockResponse;
				}, send: (response) => {
					assert.ok(response);
					assert.deepEqual(expected, response);
					return mockResponse;
				}
			};

			return userController.getAllUsers(undefined, mockResponse);
		});
	});
});
