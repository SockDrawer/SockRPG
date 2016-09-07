'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request-promise');
const Sinon = require('sinon');
const DAO = require('../../src/dao.js');
const User = require('../../src/model/User');
const Board = require('../../src/model/Board');
require('sinon-as-promised');

describe('User API', function() {
	let sandbox;
	this.timeout(50000);
	const server = require('../../src/server.js');

	before(() => {
		//Start server
		return server.setup();
	});
	
	after(() => {
		return server.stop();
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox;
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
			uri: 'http://localhost:8080/api/users',
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
				uri: 'http://localhost:8080/api/users/1',
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
				uri: 'http://localhost:8080/api/users/1',
				json: true,
				'resolveWithFullResponse': true,
				method: 'PUT',
				body: userInput
			});
		}).then((response) => {
			assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
		

			/*-------------- RETRIEVE AGAIN-----------------*/
			return request({
				uri: 'http://localhost:8080/api/users/1',
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
			uri: 'http://localhost:8080/api/users',
			json: true,
			'resolveWithFullResponse': true,
			method: 'POST',
			body: userInput
		}).then((response) => {
			assert.equal(response.statusCode, 200, 'User creation should return 200 OK');
			ID = response.body.id;
			assert.isNumber(ID, 'ID should be a number');
			
			return request({
				uri: `http://localhost:8080/api/users/${userInput.Username}`,
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

describe('Board/Game API', function() {
	let sandbox, userID, server;
	this.timeout(50000);

	before(() => {
		//Start server
		server = require('../../src/server.js');
		return server.setup().then(() => {
			return User.addUser({
				Username: 'testUser'
			});
		}).then((id) => {
			userID = id[0];
		});
	});
	
	after(() => {
		return server.stop();
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox;
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should CRUD boards', () => {
		const boardInput = {
			ID: 1,
			Name: 'surf board',
			Adult: false,
			Owner: userID
		};
		
		/*-------------- CREATE -----------------*/
		return request({
			uri: 'http://localhost:8080/api/boards',
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
				uri: 'http://localhost:8080/api/boards/1',
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
			assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
			assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
			

			/*-------------- UPDATE -----------------*/
			boardInput.Name = 'test board';

			return request({
				uri: 'http://localhost:8080/api/boards/1',
				json: true,
				'resolveWithFullResponse': true,
				method: 'PUT',
				body: boardInput
			});
		}).then((response) => {
			assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
		

			/*-------------- RETRIEVE AGAIN-----------------*/
			return request({
				uri: 'http://localhost:8080/api/boards/1',
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
			uri: 'http://localhost:8080/api/games',
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
				uri: 'http://localhost:8080/api/games/2',
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
				uri: 'http://localhost:8080/api/games/2',
				json: true,
				'resolveWithFullResponse': true,
				method: 'PUT',
				body: boardInput
			});
		}).then((response) => {
			assert.equal(response.statusCode, 200, 'Status code should be 200 OK');

			/*-------------- RETRIEVE AGAIN-----------------*/
			return request({
				uri: 'http://localhost:8080/api/games/2',
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
