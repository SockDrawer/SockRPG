'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const supertest = require('supertest');
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
	const request = supertest(`http://localhost:${port}`);

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
			return Promise.resolve().then(() => {
				return request.post('/api/users')
				.set('Accept', 'application/json')
				.send(userInput)
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					assert.equal(response.body.id, 1, 'User creation should return id');
				});
			})
			/*-------------- RETRIEVE -----------------*/
			.then(() => {
				return request.get('/api/users/1')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const body = response.body;
					assert.deepEqual(body.Canonical, '/api/users/1', 'Board canonical link should be returned');
					assert.equal(body.ID, 1, 'Board ID should match canonical link');
					assert.equal(body.Username, userInput.Username, 'Name should be returned okay');
				});
			})
			/*-------------- UPDATE -----------------*/
			.then(() => {
				userInput.userName = 'theRock';

				return request.put('/api/users/1')
				.set('Accept', 'application/json')
				.send(userInput)
				.expect(200);
			})
			/*-------------- RETRIEVE AGAIN-----------------*/
			.then(() => {
				return request.get('/api/users/1')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const body = response.body;
					assert.deepEqual(body.Canonical, '/api/users/1', 'Board canonical link should be returned');
					assert.equal(body.ID, 1, 'Board ID should match canonical link');
					assert.equal(body.Username, userInput.Username, 'Username should be returned okay');
				});
			});
		});

		it('Should retrieve by name', () => {
			const userInput = {
				Username: 'johnCena1234'
			};
			let ID;

			return Promise.resolve().then(() => {
				return request.post('/api/users')
				.set('Accept', 'application/json')
				.send(userInput)
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					ID = response.body.id;
					assert.isNumber(ID, 'ID should be a number');
				});
			})
			.then(() => {
				return request.get(`/api/users/${userInput.Username}`)
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const body = response.body;
					assert.deepEqual(body.Canonical, `/api/users/${ID}`, 'Board canonical link should be returned');
					assert.equal(body.ID, ID, 'Board ID should match canonical link');
					assert.equal(body.Username, userInput.Username, 'Name should be returned okay');
				});
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
			return Promise.resolve().then(() => {
				return request.post('/api/boards')
				.set('Accept', 'application/json')
				.send(boardInput)
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					assert.equal(response.body.id, 1, 'Board creation should return id');
				});
			})
			/*-------------- RETRIEVE -----------------*/
			.then(() => {
				return request.get('/api/boards/1')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const body = response.body;
					boardInput.GameID = null;
					assert.deepEqual(body.Canonical, '/api/boards/1', 'Board canonical link should be returned');
					assert.equal(body.ID, 1, 'Board ID should match canonical link');
					assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
					assert.equal(body.Description, boardInput.Description, 'Description should be returned okay');
					assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
					assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
				});
			})
			/*-------------- UPDATE -----------------*/
			.then(() => {
				boardInput.Name = 'test board';

				return request.put('/api/boards/1')
				.set('Accept', 'application/json')
				.send(boardInput)
				.expect(200);
			})
			/*-------------- RETRIEVE AGAIN-----------------*/
			.then(() => {
				return request.get('/api/boards/1')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const body = response.body;
					assert.deepEqual(body.Canonical, '/api/boards/1', 'Board canonical link should be returned');
					assert.equal(body.ID, 1, 'Board ID should match canonical link');
					assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
					assert.equal(body.Description, boardInput.Description, 'Description should be returned okay');
					assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
					assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
				});
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
			return Promise.resolve().then(() => {
				return request.post('/api/games')
				.set('Accept', 'application/json')
				.send(boardInput)
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					assert.equal(response.body.id, 2, 'Game creation should return id');
				});
			})
			/*-------------- RETRIEVE -----------------*/
			.then(() => {
				return request.get('/api/games/2')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const body = response.body;
					assert.deepEqual(body.Canonical, '/api/games/2', 'Game canonical link should be returned');
					assert.equal(body.ID, 2, 'ID should match canonical link');
					assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
					assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
					assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
					assert.deepEqual(body.Game, boardInput.Game, 'Game data should be returned okay');
				});
			})
			/*-------------- UPDATE -----------------*/
			.then(() => {
				boardInput.Name = 'test game';

				return request.put('/api/games/2')
				.set('Accept', 'application/json')
				.send(boardInput)
				.expect(200);
			})
			/*-------------- RETRIEVE AGAIN-----------------*/
			.then(() => {
				return request.get('/api/games/2')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.then((response) => {
					const body = response.body;
					assert.deepEqual(body.Canonical, '/api/games/2', 'Board canonical link should be returned');
					assert.equal(body.ID, 2, 'ID should match canonical link');
					assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
					assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
					assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
				});
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
			return request.post(`/api/boards/${boardID}/threads`)
			.set('Accept', 'application/json')
			.send(input)
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				assert.equal(response.body.id, 1, 'Thread creation should return id');
			});
		});

		it('Should retrieve said threads', () => {
			return request.get(`/api/boards/${boardID}/threads`)
			.set('Accept', 'application/json')
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
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
			return request.put(`/api/threads/${threadID}`)
			.set('Accept', 'application/json')
			.send(input)
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				assert.equal(response.body.id, 1, 'post creation should return id');
			});
		});

		it('Should retrieve posts with threads', () => {
			return request.get(`/api/threads/${threadID}`)
			.set('Accept', 'application/json')
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				assert.deepEqual(response.body.posts, [{
					ID: 1,
					Body: '<p>This is the body</b>',
					Canonical: '/api/posts/1',
					Thread: 2
				}], 'Thread retrieval should return post');
			});
		});
	});
});
