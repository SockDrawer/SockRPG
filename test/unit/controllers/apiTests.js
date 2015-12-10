'use strict';
const Path = require('path');
const Chai = require('chai');
const assert = Chai.assert;
const Sinon = require('sinon');
require('sinon-as-promised');
const api = require(Path.resolve(__dirname, '../../../src/controllers/apiController.js'));
const dao = require(Path.resolve(__dirname, '../../../src/dao.js'));

describe('Game API controller', () => {
	let sandbox;

	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox.create();
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

			sandbox.stub(dao, 'getAllGames').resolves(data);
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

			return api.getAllGames(undefined, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Error: oops i asploded'
			};

			sandbox.stub(dao, 'getAllGames').rejects('oops i asploded');

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

			return api.getAllGames(undefined, mockResponse);
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

			sandbox.stub(dao, 'getAllBoards').resolves(data);
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

			return api.getAllBoards(undefined, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Error: oops i asploded'
			};

			sandbox.stub(dao, 'getAllBoards').rejects('oops i asploded');

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

			return api.getAllBoards(undefined, mockResponse);
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
				IC: null
			};

			sandbox.stub(dao, 'getGame').resolves(data);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				}, send: (response) => {
					data.canonical = '/game/1';
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return api.getGame(mockRequest, mockResponse);
		});

		it('should return only the first game if one exists', () => {
			const data = [{
				ID: '1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}, {
				ID: '2',
				Name: 'evil game',
				Adult: true,
				GameMasters: null,
				Tags: [],
				IC: null
			}];

			sandbox.stub(dao, 'getGame').resolves(data);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					data[0].canonical = '/game/1';
					assert.deepEqual(data[0], response);
					return mockResponse;
				}
			};

			return api.getGame(mockRequest, mockResponse);
		});

		it('should return a 404 if no game exists', () => {
			sandbox.stub(dao, 'getGame').resolves(undefined);

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

			return api.getGame(mockRequest, mockResponse);
		});

		it('should return a 501 if no ID passed in', () => {
			sandbox.stub(dao, 'getGame').resolves(undefined);

			const mockRequest = {
				params: {
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(501, code, 'Should return a 501');
					return mockResponse;
				},
				send: (response) => {
					assert.deepEqual(response, {error: 'Missing ID'});
					return mockResponse;
				}
			};

			return api.getGame(mockRequest, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Error: oops i asploded'
			};

			sandbox.stub(dao, 'getGame').rejects('oops i asploded');

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

			return api.getGame(mockRequest, mockResponse);
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
				IC: null
			};

			sandbox.stub(dao, 'getBoard').resolves(data);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					data.canonical = '/board/1';
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return api.getBoard(mockRequest, mockResponse);
		});

		it('should return only the first board board if one exists', () => {
			const data = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}, {
				ID: '2',
				Name: 'evil board',
				Adult: true,
				GameMasters: null,
				Tags: [],
				IC: null
			}];

			sandbox.stub(dao, 'getBoard').resolves(data);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					data[0].canonical = '/board/1';
					assert.deepEqual(data[0], response);
					return mockResponse;
				}
			};

			return api.getBoard(mockRequest, mockResponse);
		});

		it('should return a 404 if no board exists', () => {
			sandbox.stub(dao, 'getBoard').resolves(undefined);

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

			return api.getBoard(mockRequest, mockResponse);
		});

		it('should return a 501 if no ID passed in', () => {
			sandbox.stub(dao, 'getBoard').resolves(undefined);

			const mockRequest = {
				params: {
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(501, code, 'Should return a 501');
					return mockResponse;
				},
				send: (response) => {
					assert.deepEqual(response, {error: 'Missing ID'});
					return mockResponse;
				}
			};

			return api.getBoard(mockRequest, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Error: oops i asploded'
			};

			sandbox.stub(dao, 'getBoard').rejects('oops i asploded');

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

			return api.getBoard(mockRequest, mockResponse);
		});
	});
});

describe('User API Controller', () => {
	let sandbox;

	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox;
	});

	afterEach( () => {
		sandbox.restore();
	});

	describe('/api/users', () => {
		it('should return a list of users', () => {
			const data = [{
				ID: '1',
				Name: 'user1',
				Admin: true
			}, {
				ID: '2',
				Name: 'user2',
				Admin: false
			}];

			sandbox.stub(dao, 'getAllUsers').resolves(data);
			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					data[0].canonical = 'api/users/1';
					data[1].canonical = 'api/users/2';
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return api.getAllUsers(undefined, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Error: oops i asploded'
			};

			sandbox.stub(dao, 'getAllUsers').rejects('oops i asploded');

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

			return api.getAllUsers(undefined, mockResponse);
		});
	});

	describe('/api/user/{ID}', () => {
		it('should return a user if one exists by ID', () => {
			const data = {
				ID: '1',
				Name: 'user1',
				Admin: true
			};

			sandbox.stub(dao, 'getUser').resolves(data);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					assert.isTrue(dao.getUser.called, 'Should call the user search by id');
					data.canonical = 'api/users/1';
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return api.getUser(mockRequest, mockResponse);
		});

		it('should return a user if one exists by name', () => {
			const data = {
				ID: '1',
				Name: 'user1',
				Admin: true
			};

			sandbox.stub(dao, 'getUserByName').resolves(data);

			const mockRequest = {
				params: {
					id: 'user1'
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					assert.isTrue(dao.getUserByName.called, 'Should call the user search by name');
					data.canonical = 'api/users/1';
					assert.deepEqual(data, response);
					return mockResponse;
				}
			};

			return api.getUser(mockRequest, mockResponse);
		});

		it('should return only the first user if more than one exists', () => {
			const data = [{
				ID: '1',
				Name: 'user1',
				Admin: true
			}, {
				ID: '2',
				Name: 'user2',
				Admin: false
			}];

			sandbox.stub(dao, 'getUser').resolves(data);

			const mockRequest = {
				params: {
					id: 1
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
					data[0].canonical = '/users/1';
					assert.deepEqual(data[0], response);
					return mockResponse;
				}
			};

			return api.getUser(mockRequest, mockResponse);
		});

		it('should return a 404 if no such user exists', () => {
			sandbox.stub(dao, 'getUser').resolves(undefined);

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
				}
			};

			return api.getUser(mockRequest, mockResponse);
		});

		it('should return a 501 if no ID passed in', () => {
			sandbox.stub(dao, 'getUser').resolves(undefined);

			const mockRequest = {
				params: {
				}
			};

			const mockResponse = {
				status: (code) => {
					assert.equal(501, code, 'Should return a 501');
					return mockResponse;
				},
				send: (response) => {
					assert.deepEqual(response, {error: 'Missing ID'});
					return mockResponse;
				}
			};

			return api.getUser(mockRequest, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Error: oops i asploded'
			};

			sandbox.stub(dao, 'getUser').rejects('oops i asploded');

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

			return api.getUser(mockRequest, mockResponse);
		});
	});
});
