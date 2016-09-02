'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request-promise');
const Sinon = require('sinon');
const DAO = require('../../src/dao.js');
require('sinon-as-promised');

describe.only('placeholder', () => {
	
});

describe('Board API', function() {
	let sandbox, userID;
	this.timeout(50000);

	before(() => {
		//Start server
		const server = require('../../src/server.js');
		return server.setup().then(() => {
			return DAO.addUser({
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
			assert.deepEqual(body.data, boardInput, 'Board should be returned unchanged');

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
			assert.deepEqual(body.data, JSON.parse(JSON.stringify(boardInput)), 'Board should be returned unchanged');
		});
	});
});
