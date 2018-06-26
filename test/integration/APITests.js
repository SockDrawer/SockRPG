'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request-promise');
const Sinon = require('sinon');
const User = require('../../src/model/User');
const Board = require('../../src/model/Board');
const Thread = require('../../src/model/Thread');

// TODO: we really shouldnt rely on environment in tests.... yeah? :-)
// eslint-disable-next-line no-process-env
const port = process.env.PORT || 9000;

context('API server', function() {
	this.timeout(50000);
	const server = require('../../src/server.js');

	before(() => {
		//Start server
		return server.setup({
			database: {
				filename: ':memory:'
			}
		});
	});

	after(() => {
		return server.stop();
	});

	describe('User API', () => {
		let sandbox;
		beforeEach(() => {
			sandbox = Sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should CRUD users', () => {
			const userInput = {
				ID: 1,
				Username: 'johnCena'
			};

			/*-------------- CREATE -----------------*/
			return request({
				uri: `http://localhost:${port}/api/users`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'POST',
				body: userInput
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'User creation should return 200 OK');
				assert.equal(response.body.id, 1, 'User creation should return id');

				/*-------------- RETRIEVE -----------------*/
				return request({
					json: true,
					uri: `http://localhost:${port}/api/users/1`,
					'resolveWithFullResponse': true,
					method: 'GET'
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Board retrieval should return 200 OK');
				const body = response.body;
				assert.deepEqual(body.Canonical, '/api/users/1', 'Board canonical link should be returned');
				assert.equal(body.ID, 1, 'Board ID should match canonical link');
				assert.equal(body.Username, userInput.Username, 'Name should be returned okay');

				/*-------------- UPDATE -----------------*/
				userInput.userName = 'theRock';

				return request({
					uri: `http://localhost:${port}/api/users/1`,
					json: true,
					'resolveWithFullResponse': true,
					method: 'PUT',
					body: userInput
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');


				/*-------------- RETRIEVE AGAIN-----------------*/
				return request({
					uri: `http://localhost:${port}/api/users/1`,
					json: true,
					'resolveWithFullResponse': true,
					method: 'GET'
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
				const body = response.body;
				assert.deepEqual(body.Canonical, '/api/users/1', 'Board canonical link should be returned');
				assert.equal(body.ID, 1, 'Board ID should match canonical link');
				assert.equal(body.Username, userInput.Username, 'Username should be returned okay');
			});
		});

		it('Should retrieve by name', () => {
			const userInput = {
				Username: 'johnCena1234'
			};
			let ID;

			return request({
				uri: `http://localhost:${port}/api/users`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'POST',
				body: userInput
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'User creation should return 200 OK');
				ID = response.body.id;
				assert.isNumber(ID, 'ID should be a number');

				return request({
					uri: `http://localhost:${port}/api/users/${userInput.Username}`,
					json: true,
					'resolveWithFullResponse': true,
					method: 'GET'
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Board retrieval should return 200 OK');
				const body = response.body;
				assert.deepEqual(body.Canonical, `/api/users/${ID}`, 'Board canonical link should be returned');
				assert.equal(body.ID, ID, 'Board ID should match canonical link');
				assert.equal(body.Username, userInput.Username, 'Name should be returned okay');
			});
		});
	});

	describe('Board/Game API', () => {
		let userID, sandbox;

		before(() => {
			return User.addUser({
				Username: 'testUser'
			}).then((id) => {
				userID = id[0];
			});
		});

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should CRUD boards', () => {
			const boardInput = {
				ID: 1,
				Name: 'surf board',
				Description: 'surf is up dudes',
				Adult: false,
				Owner: userID
			};

			/*-------------- CREATE -----------------*/
			return request({
				uri: `http://localhost:${port}/api/boards`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'POST',
				body: boardInput
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Board creation should return 200 OK');
				assert.equal(response.body.id, 1, 'Board creation should return id');

				/*-------------- RETRIEVE -----------------*/
				return request({
					json: true,
					uri: `http://localhost:${port}/api/boards/1`,
					'resolveWithFullResponse': true,
					method: 'GET'
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Board retrieval should return 200 OK');
				const body = response.body;
				boardInput.GameID = null;
				assert.deepEqual(body.Canonical, '/api/boards/1', 'Board canonical link should be returned');
				assert.equal(body.ID, 1, 'Board ID should match canonical link');
				assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
				assert.equal(body.Description, boardInput.Description, 'Description should be returned okay');
				assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
				assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');


				/*-------------- UPDATE -----------------*/
				boardInput.Name = 'test board';

				return request({
					uri: `http://localhost:${port}/api/boards/1`,
					json: true,
					'resolveWithFullResponse': true,
					method: 'PUT',
					body: boardInput
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');


				/*-------------- RETRIEVE AGAIN-----------------*/
				return request({
					uri: `http://localhost:${port}/api/boards/1`,
					json: true,
					'resolveWithFullResponse': true,
					method: 'GET'
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
				const body = response.body;
				assert.deepEqual(body.Canonical, '/api/boards/1', 'Board canonical link should be returned');
				assert.equal(body.ID, 1, 'Board ID should match canonical link');
				assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
				assert.equal(body.Description, boardInput.Description, 'Description should be returned okay');
				assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
				assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
			});
		});

		it('Should CRUD games', () => {
			const boardInput = {
				ID: 2,
				Name: 'surf board',
				Adult: false,
				Owner: userID,
				Game: {
					ID: 1,
					gameDescription: 'a cool game'
				}
			};

			/*-------------- CREATE -----------------*/
			return request({
				uri: `http://localhost:${port}/api/games`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'POST',
				body: boardInput
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Game creation should return 200 OK');
				assert.equal(response.body.id, 2, 'Game creation should return id');

				/*-------------- RETRIEVE -----------------*/
				return request({
					json: true,
					uri: `http://localhost:${port}/api/games/2`,
					'resolveWithFullResponse': true,
					method: 'GET'
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Board retrieval should return 200 OK');
				const body = response.body;
				assert.deepEqual(body.Canonical, '/api/games/2', 'Game canonical link should be returned');
				assert.equal(body.ID, 2, 'ID should match canonical link');
				assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
				assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
				assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
				assert.deepEqual(body.Game, boardInput.Game, 'Game data should be returned okay');


				/*-------------- UPDATE -----------------*/
				boardInput.Name = 'test game';

				return request({
					uri: `http://localhost:${port}/api/games/2`,
					json: true,
					'resolveWithFullResponse': true,
					method: 'PUT',
					body: boardInput
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');

				/*-------------- RETRIEVE AGAIN-----------------*/
				return request({
					uri: `http://localhost:${port}/api/games/2`,
					json: true,
					'resolveWithFullResponse': true,
					method: 'GET'
				});
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
				const body = response.body;
				assert.deepEqual(body.Canonical, '/api/games/2', 'Board canonical link should be returned');
				assert.equal(body.ID, 2, 'ID should match canonical link');
				assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
				assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
				assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
			});
		});
	});

	describe('Thread API', () => {
		let boardID;

		before(() => {
			return User.addUser({
				Username: 'testUser2345'
			})
			.then((userIDs) => Board.addBoard({
				Owner: userIDs[0],
				Name: 'A board'
			}))
			.then((boardIDs) => {
				boardID = boardIDs[0];
			});
		});

		it('Should allow adding threads', () => {
			const input = {
				ID: 1,
				Title: 'The best thread'
			};

			/*-------------- CREATE -----------------*/
			return request({
				uri: `http://localhost:${port}/api/boards/${boardID}/threads`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'POST',
				body: input
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Thread creation should return 200 OK');
				assert.equal(response.body.id, 1, 'Thread creation should return id');
			});
		});

		it('Should retrieve said threads', () => {
			return request({
				uri: `http://localhost:${port}/api/boards/${boardID}/threads`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'GET'
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Thread creation should return 200 OK');
				assert.deepEqual(response.body, [{
					ID: 1,
					Title: 'The best thread',
					Canonical: '/api/threads/1'
				}], 'Thread retrieval should return thread');
			});
		});
	});

	describe('Post API', () => {
		let boardID, threadID;

		before(() => {
			return User.addUser({
				Username: 'testUser7890'
			})
			.then((userIDs) => Board.addBoard({
				Owner: userIDs[0],
				Name: 'A board'
			}))
			.then((boardIDs) => {
				boardID = boardIDs[0];
			})
			.then(() => Thread.addThread({
				Title: 'A Thread',
				Board: boardID
			}))
			.then((threadIDs) => {
				threadID = threadIDs[0];
			});
		});

		it('Should allow adding posts', () => {
			const input = {
				Body: '<p>This is the body</b>'
			};

			/*-------------- CREATE -----------------*/
			return request({
				uri: `http://localhost:${port}/api/threads/${threadID}`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'PUT',
				body: input
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'post creation should return 200 OK');
				assert.equal(response.body.id, 1, 'post creation should return id');
			});
		});

		it('Should retrieve posts with threads', () => {
			return request({
				uri: `http://localhost:${port}/api/threads/${threadID}`,
				json: true,
				'resolveWithFullResponse': true,
				method: 'GET'
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Thread retrieval should return 200 OK');
				assert.deepEqual(response.body.posts, [{
					ID: 1,
					Body: '<p>This is the body</b>',
					Canonical: '/api/posts/1'
				}], 'Thread retrieval should return post');
			});
		});
	});
});
