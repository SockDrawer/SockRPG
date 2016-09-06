'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request-promise');
const Sinon = require('sinon');
const DAO = require('../../src/dao.js');
const User = require('../../src/model/User');
const Board = require('../../src/model/Board');
require('sinon-as-promised');


describe('Board/Game API', function() {
	let sandbox, userID;
	this.timeout(50000);

	before(() => {
		//Start server
		const server = require('../../src/server.js');
		return server.setup().then(() => {
			return User.addUser({
				Username: 'testUser'
			});
		}).then((id) => {
			userID = id[0];
		});
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
			//assert.deepEqual(body.Game, boardInput.Game, 'Game data should be returned okay');
			
		});
		// 	/*-------------- UPDATE -----------------*/
		// 	boardInput.Name = 'test game';

		// 	return request({
		// 		uri: 'http://localhost:8080/api/games/2',
		// 		json: true,
		// 		'resolveWithFullResponse': true,
		// 		method: 'PUT',
		// 		body: boardInput
		// 	});
		// }).then((response) => {
		// 	assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
		

		// 	/*-------------- RETRIEVE AGAIN-----------------*/
		// 	return request({
		// 		uri: 'http://localhost:8080/api/games/2',
		// 		json: true,
		// 		'resolveWithFullResponse': true,
		// 		method: 'GET'
		// 	});
		// }).then((response) => {
		// 	assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
		// 	const body = response.body;
		// 	assert.deepEqual(body.Canonical, '/api/games/2', 'Board canonical link should be returned');
		// 	assert.equal(body.ID, 2, 'ID should match canonical link');
		// 	assert.equal(body.Name, boardInput.Name, 'Name should be returned okay');
		// 	assert.equal(body.Adult, boardInput.Adult, 'Adult should be returned okay');
		// 	assert.equal(body.Owner, boardInput.Owner, 'Owner should be returned okay');
		// });
	});
});
