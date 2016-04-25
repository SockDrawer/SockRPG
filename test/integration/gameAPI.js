'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request-promise');
const Sinon = require('sinon');
require('sinon-as-promised');
const dao = require('../../src/dao.js');


describe('Game API', () => {
	let sandbox;

	before(() => {
		//Start server
		const server = require('../../src/server.js');
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox;
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('/api/games', () => {
		it('should return a list of games on GET', () => {

			const data = [{
				ID: '1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}];

			sandbox.stub(dao, 'getAllGames').resolves(data);

			const expected = [{
				ID: '1',
				Canonical: '/api/games/1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}];
			return request({
				uri: 'http://localhost:8080/api/games',
				json: true,
				'resolveWithFullResponse': true
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
				assert.deepEqual(response.body, expected, 'Body should contain data');
			});
		});

		it('should add a game on Post', () => {
			const formData = {
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};
			sandbox.stub(dao, 'addGame').resolves(true);

			return request({
				uri: 'http://localhost:8080/api/games',
				method: 'POST',
				body: formData,
				json: true,
				'resolveWithFullResponse': true
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
			});
		});

		it('should reject Patch', () => {
			return request({
				uri: 'http://localhost:8080/api/games',
				method: 'PATCH'
			}).then(() => {
				assert.fail('Request should not have resolved');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Patch should not be accepted');
			});
		});

		it('should reject Put', () => {
			return request({
				uri: 'http://localhost:8080/api/games',
				method: 'PUT'
			}).then(() => {
				assert.fail('Request should not have resolved');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Put should not be accepted');
			});
		});

		it('should reject Delete', () => {
			return request({
				uri: 'http://localhost:8080/api/games',
				method: 'DELETE'
			}).then(() => {
				assert.fail('Request should not have resolved');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Delete should not be accepted');
			});
		});
	});

	describe('/api/games/:id', () => {
		it('should return a game on GET', () => {
			const expected = {
				ID: '1',
				Canonical: '/api/games/1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			const data = [{
				ID: '1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}];

			sandbox.stub(dao, 'getGame').resolves(data);

			return request({
				uri: 'http://localhost:8080/api/games/1',
				json: true,
				'resolveWithFullResponse': true
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
				assert.deepEqual(response.body, expected, 'Body should contain data');
			});
		});

		it('should not return an invalid game', () => {
			return request({
				uri: 'http://localhost:8080/api/games/1111',
				method: 'GET'
			}).then(() => {
				assert.fail('Request should not resolve.');
			}, (err) => {
				assert.equal(err.statusCode, 404, 'Invalid game should not be returned');
			});
		});

		it('should update a game on PUT', () => {
			sandbox.stub(dao, 'updateGame').resolves();

			const formData = {
				GameID: 1111,
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			return request({
				uri: 'http://localhost:8080/api/games/1111',
				method: 'PUT',
				body: formData,
				json: true,
				'resolveWithFullResponse': true
			}).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK.');
			});
		});

		it('should fail to update a nonexistant game on PUT', () => {
			const formData = {
				GameID: 1111,
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			return request({
				uri: 'http://localhost:8080/api/games/1111',
				method: 'PUT',
				body: formData,
				json: true
			}).then(() => {
				assert.fail('Request should not have resolved!');
			}, (error) => {
				assert.equal(error.statusCode, 404, 'Status code should be 200 OK.');
			});
		});

		it('should reject Patch', () => {
			return request({
				uri: 'http://localhost:8080/api/games/1',
				method: 'PATCH'
			}).then(() => {
				assert.fail('Request should not have resolved');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Patch should not be accepted');
			});
		});

		it('should reject Post', () => {
			return request({
				uri: 'http://localhost:8080/api/games/1',
				method: 'POST'
			}).then(() => {
				assert.fail('Request should not have resolved');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Patch should not be accepted');
			});
		});

		it('should reject Del', () => {
			return request({
				uri: 'http://localhost:8080/api/games/1',
				method: 'DELETE'
			}).then(() => {
				assert.fail('Request should not have resolved');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Patch should not be accepted');
			});
		});
	});
});
