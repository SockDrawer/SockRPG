'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const supertest = require('supertest');
const express = require('express');
const Sinon = require('sinon');
const User = require('../../src/model/User');
const Board = require('../../src/model/Board');
const Thread = require('../../src/model/Thread');
const moment = require('moment');

context('API server', function() {
	this.timeout(50000);
	const server = require('../../src/server.js');
	const requestBaseUrl = 'http://localhost:9000';
	
	// Function to construct a CSRF-aware HTTP API agent
	const getAgent = () => {
		const agent = supertest.agent(requestBaseUrl);
		return agent.get('/api/session')
			.set('Accept', 'application/json')
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				const csrfToken = response.body.CsrfToken;
				
				return {
					get: (path) =>
						agent.get(path)
						.set('Accept', 'application/json'),
					post: (path) =>
						agent.post(path)
						.set('X-CSRF-Token', csrfToken)
						.set('Accept', 'application/json'),
					put: (path) =>
						agent.put(path)
						.set('X-CSRF-Token', csrfToken)
						.set('Accept', 'application/json'),
					delete: (path) =>
						agent.delete(path)
						.set('X-CSRF-Token', csrfToken)
				};
			});
	};
	
	before(() => {
		//Start server
		return Promise.resolve()
		.then(() => server.setup({
			database: {
				filename: ':memory:'
			},
			http: {
				port: 9000
			}
		}, express));
	});

	after(() => {
		return server.stop();
	});

	describe('User API', () => {
		let sandbox, request;
		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			return getAgent().then((val) => {
				request = val;
			});
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should CRUD users', () => {
			const userInput = {
				ID: 1,
				Username: 'johnCena',
				Admin: false,
				Password: 'dontusethispassword'
			};

			/*-------------- CREATE -----------------*/
			return Promise.resolve().then(() => {
				return request.post('/api/users')
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
				.send(userInput)
				.expect(200);
			})
			/*-------------- RETRIEVE AGAIN-----------------*/
			.then(() => {
				return request.get('/api/users/1')
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
				Username: 'johnCena1234',
				Admin: false,
				Password: 'dontusethispassword'
			};
			let ID;

			return Promise.resolve().then(() => {
				return request.post('/api/users')
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
		let userID;

		before(() => {
			return User.addUser({
				Username: 'testUser',
				Admin: false,
				Password: 'dontusethispassword'
			}).then((id) => {
				userID = id[0];
			});
		});

		let sandbox, request;
		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			return getAgent().then((val) => {
				request = val;
			});
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
				.send(boardInput)
				.expect(200);
			})
			/*-------------- RETRIEVE AGAIN-----------------*/
			.then(() => {
				return request.get('/api/boards/1')
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
				.send(boardInput)
				.expect(200);
			})
			/*-------------- RETRIEVE AGAIN-----------------*/
			.then(() => {
				return request.get('/api/games/2')
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
				Username: 'testUser2345',
				Admin: false,
				Password: 'dontusethispassword'
			})
			.then((userIDs) => Board.addBoard({
				Owner: userIDs[0],
				Name: 'A board'
			}))
			.then((boardIDs) => {
				boardID = boardIDs[0];
			});
		});
		
		let sandbox, request;
		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			return getAgent().then((val) => {
				request = val;
			});
		});

		afterEach(() => {
			sandbox.restore();
		});
		
		it('Should allow adding threads', () => {
			const input = {
				ID: 1,
				Title: 'The best thread'
			};

			/*-------------- CREATE -----------------*/
			return request.post(`/api/boards/${boardID}/threads`)
			.send(input)
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				assert.equal(response.body.id, 1, 'Thread creation should return id');
			});
		});

		it('Should retrieve said threads', () => {
			return request.get(`/api/boards/${boardID}/threads`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				assert.deepEqual(response.body, [{
					ID: 1,
					Title: 'The best thread',
					PostCount: 0,
					Canonical: '/api/threads/1'
				}], 'Thread retrieval should return thread');
			});
		});
	});

	describe('Post API', () => {
		let boardID, threadID;

		before(() => {
			return User.addUser({
				Username: 'testUser7890',
				Admin: false,
				Password: 'dontusethispassword'
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

		let sandbox, clock, request;
		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			clock = Sinon.useFakeTimers();
			return getAgent().then((val) => {
				request = val;
			});
		});

		afterEach(() => {
			sandbox.restore();
			clock.restore();
		});
		
		it('Should allow adding posts', () => {
			const input = {
				Body: '<p>This is the body</b>',
				Poster: 1
			};

			/*-------------- CREATE -----------------*/
			return request.put(`/api/threads/${threadID}`)
			.send(input)
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				assert.equal(response.body.id, 1, 'post creation should return id');
			});
		});

		it('Should retrieve posts with threads', () => {
			return request.get(`/api/threads/${threadID}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
			.then((response) => {
				assert.deepEqual(response.body.posts, [{
					ID: 1,
					Body: '<p>This is the body</b>',
					Canonical: '/api/posts/1',
					Thread: 2,
					Poster: 0, //there's no session information when we added the post
					Created: moment('1970-01-01T00:00:00.000Z').format(), //local time zone
					created_at: '1970-01-01T00:00:00.000Z' //UTC
				}], 'Thread retrieval should return post');

				assert.equal(response.body.posts.length, 1);				
				assert.equal(response.body.PostCount, 1);
			});
		});
	});
});
