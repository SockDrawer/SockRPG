'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request');
const http = require('http');
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
		it('should return a list of games on GET', (done) => {

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
				Canonical: '/api/game/1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}];

			request.get('http://localhost:8080/api/games', (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				assert.deepEqual(expected, JSON.parse(body), 'Body should contain data');
				done();
			});
		});

		it('should add a game on Post', (done) => {
			const formData = {
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};
			sandbox.stub(dao, 'addGame').resolves(true);

			request.post({
				url: 'http://localhost:8080/api/games',
				form: formData
			}, (error, response) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				done();
			});
		});

		it('should reject Patch', (done) => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/games',
				method: 'PATCH'
			});
			req.end();

			req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
				done();
			});
		});

		it('should reject Put', (done) => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/games',
				method: 'PUT'
			});


			req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Put should not be accepted');
				done();
			});
			req.end();
		});

		it('should reject Del', (done) => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/games',
				method: 'DELETE'
			});
			req.end();

			req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Delete should not be accepted');
				done();
			});
		});
	});

	describe('/api/game', () => {
		it('should return a game on GET', (done) => {
			const expected = {
				ID: '1',
				Canonical: '/api/game/1',
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

			request.get('http://localhost:8080/api/game/1', (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				assert.deepEqual(expected, JSON.parse(body), 'Body should contain data');
				done();
			});
		});

		it('should not return an invalid game', (done) => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/game/1111',
				method: 'GET'
			});
			req.end();

			req.on('response', (response) => {
				assert.equal(404, response.statusCode, 'Invalid game should not be returned');
				done();
			});
		});

		it('should update a game on PUT', (done) => {
			sandbox.stub(dao, 'updateGame').resolves();

			const formData = {
				GameID: 1111,
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/game/1111',
				method: 'PUT',
				headers: {
					'Content-type': 'application/json'
				}
			});
			req.write(`${JSON.stringify(formData)}\n`);
			req.end();

			req.on('response', (response) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK.');
				done();
			});
		});

		it('should fail to update a nonexistant game on PUT', (done) => {
			const formData = {
				GameID: 1111,
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/game/1111',
				method: 'PUT',
				headers: {
					'Content-type': 'application/json'
				}
			});
			req.write(`${JSON.stringify(formData)}\n`);
			req.end();

			req.on('response', (response) => {
				assert.equal(404, response.statusCode, 'Status code should be 404 NOT FOUND.');
				done();
			});
		});

		it('should reject Patch', (done) => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/game/1',
				method: 'PATCH'
			});
			req.end();

			req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
				done();
			});
		});

		it('should reject Post', (done) => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/game/1',
				method: 'POST'
			});
			req.end();

			req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Post should not be accepted');
				done();
			});
		});

		it('should reject Del', (done) => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/game/1',
				method: 'DELETE'
			});
			req.end();

			req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Delete should not be accepted');
				done();
			});
		});
	});
});
