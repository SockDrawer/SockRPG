'use strict';
const Path = require('path');
const Chai = require('chai');
const assert = Chai.assert;
const Sinon = require('sinon');
require('sinon-as-promised');
const api = require(Path.resolve(__dirname, '../../src/apiController.js'));
const dao = require(Path.resolve(__dirname, '../../src/dao.js'));

describe('Game API controller', () => {
	let sandbox;
	
	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox;
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
			},
			{
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
			
			return api.getAllGames(mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Database error: Error: oops i asploded'
			}
					
			sandbox.stub(dao, 'getAllGames').rejects('oops i asploded');

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
			
			return api.getAllGames(mockResponse);
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
			},
			{
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
			
			return api.getAllBoards(mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Database error: Error: oops i asploded'
			}
					
			sandbox.stub(dao, 'getAllBoards').rejects('oops i asploded');
			var start = new Date();

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
			
			return api.getAllBoards(mockResponse);
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
			}

			const mockResponse = {
				status: (code) => {
					assert.equal(200, code, 'Should return a 200 ok if anything');
					return mockResponse;
				},
				send: (response) => {
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
			},
			{
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
			}

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
			}

			const mockResponse = {
				status: (code) => {
					assert.equal(404, code, 'Should return a 404 if anything');
					return mockResponse;
				},
				send: (response) => {
					assert.notOk(true, "Should not send data");
					return mockResponse;
				}
			};
			
			return api.getGame(mockRequest, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Database error: Error: oops i asploded'
			}
					
			sandbox.stub(dao, 'getGame').rejects('oops i asploded');

			const mockRequest = {
				params: {
					id: 1
				}
			}

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
			}

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
			},
			{
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
			}

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
			}

			const mockResponse = {
				status: (code) => {
					assert.equal(404, code, 'Should return a 404 if anything');
					return mockResponse;
				},
				send: (response) => {
					assert.notOk(true, "Should not send data");
					return mockResponse;
				}
			};
			
			return api.getBoard(mockRequest, mockResponse);
		});

		it('should respond with an error when the DB errors', () => {

			const expected = {
				error: 'Database error: Error: oops i asploded'
			}
					
			sandbox.stub(dao, 'getBoard').rejects('oops i asploded');

			const mockRequest = {
				params: {
					id: 1
				}
			}

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
