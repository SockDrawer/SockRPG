'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request');
const http = require('http');
const Sinon = require('sinon');
require('sinon-as-promised');
const dao = require('../../src/dao.js');


describe('Board API', () => {
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

	describe('/api/boards', () => {
		it('should return a list of boards on GET', (done) => {

			const data = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			}];

			sandbox.stub(dao, 'getAllBoards').resolves(data);

			const expected = [{
				ID: '1',
				Canonical: '/api/board/1',
				Name: 'test board',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			}];

			request.get('http://localhost:8080/api/boards', (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				assert.deepEqual(expected, JSON.parse(body), 'Body should contain data');
				done();
			});
		});

		it('should add a board on Post', (done) => {
			const formData = {
				Name: 'test board',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			};
			sandbox.stub(dao, 'addBoard');

			request.post({
				url: 'http://localhost/api/boards',
				formData: formData
			}, (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				const data = JSON.parse(body);
				assert.property(data, 'id', 'ID was not returned');

			});

			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/board/1111',
				method: 'DELETE'
			});
			req.end();
		});

		it('should reject Patch', () => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/boards',
				method: 'PATCH'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
			});
		});

		it('should reject Put', () => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/boards',
				method: 'PUT'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Put should not be accepted');
			});
		});

		it('should reject Del', () => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/boards',
				method: 'DELETE'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Delete should not be accepted');
			});
		});
	});

	describe('/api/board', () => {
		it('should return a board on GET', (done) => {
			const expected = {
				ID: '1',
				Canonical: '/api/board/1',
				Name: 'test board',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			};

			const data = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			}];

			sandbox.stub(dao, 'getBoard').resolves(data);

			request.get('http://localhost:8080/api/board/1', (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				assert.deepEqual(expected, JSON.parse(body), 'Body should contain data');
				done();
			});
		});

		it('should not return an invalid board', () => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/board/1111',
				method: 'DELETE'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(404, response.statusCode, 'Invalid board should not be returned');
			});
		});

		it('should update a board on PUT', () => {
			const formData = {
				Name: 'test board edited!',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			};

			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/board/1111',
				method: 'DELETE'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				
			});
		});

		it('should reject Patch', () => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/board/1',
				method: 'PATCH'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
			});
		});

		it('should reject Post', () => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/board/1',
				method: 'POST'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Post should not be accepted');
			});
		});

		it('should reject Del', () => {
			const req = http.request({
				host: 'localhost',
				port: '8080',
				path: '/api/board/1',
				method: 'DELETE'
			});
			req.end();

			return req.on('response', (response) => {
				assert.equal(405, response.statusCode, 'Delete should not be accepted');
			});
		});
	});
});
