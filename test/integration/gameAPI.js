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
	
	afterEach( () => {
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
			sandbox.stub(dao, 'addBoard');

			request.post({
				url: 'http://localhost/api/games',
				formData: formData
			}, (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				const data = JSON.parse(body);
				assert.property(data, 'id', 'ID was not returned');
				
			});
			
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/game/1111',
					method: 'DELETE'
			});
			request.end();			
		});

		it('should reject Patch', () => {
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/games',
					method: 'PATCH'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
			});
		});

		it('should reject Put', () => {
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/games',
					method: 'PUT'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(405, response.statusCode, 'Put should not be accepted');
			});
		});

		it('should reject Del', () => {
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/games',
					method: 'DELETE'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(405, response.statusCode, 'Delete should not be accepted');
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

		it('should not return an invalid game', () => {
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/game/1111',
					method: 'DELETE'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(404, response.statusCode, 'Invalid game should not be returned');
			});
		});

		it('should update a game on PUT', () => {
			const formData = {
				Name: 'test game edited!',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};
			
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/game/1111',
					method: 'DELETE'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
			});
		});

		it('should reject Patch', () => {
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/game/1',
					method: 'PATCH'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
			});
		});

		it('should reject Post', () => {
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/game/1',
					method: 'POST'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(405, response.statusCode, 'Post should not be accepted');
			});
		});

		it('should reject Del', () => {
			var request = http.request({
					host: 'localhost',
					port: '8080',
					path:  '/api/game/1',
					method: 'DELETE'
			});
			request.end();
			
			return request.on('response', function(response) {
				assert.equal(405, response.statusCode, 'Delete should not be accepted');
			});
		});
	});
});
