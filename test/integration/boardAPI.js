'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request-promise');
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
		it('should return a list of boards on GET', () => {
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

			const req = {
				method: 'GET',
				uri: 'http://localhost:8080/api/boards',
				json: true,
				'resolveWithFullResponse': true
			};

			return request(req).then((response) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.deepEqual(expected, response.body, 'Body should contain data');
			});
		});

		it('should add a board on Post', () => {
			const formData = {
				Name: 'test board',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			};
			sandbox.stub(dao, 'addBoard').resolves(true);
			const req = {
				uri: 'http://localhost:8080/api/boards',
				method: 'POST',
				body: formData,
				json: true,
				'resolveWithFullResponse': true
			};
			return request(req).then((response) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
			});
		});

		it('should reject Patch', () => {
			const req = {
				uri: 'http://localhost:8080/api/boards',
				method: 'PATCH'
			};
			return request(req).then(() => {
				assert.fail('Should not have resolved the promise!');
			}, (response) => {
				assert.equal(response.statusCode, 405, 'Status code should indicate method not allowed');
			});
		});

		it('should reject Put', () => {
			const req = {
				uri: 'http://localhost:8080/api/boards',
				method: 'PATCH'
			};
			return request(req).then(() => {
				assert.fail('Should not have resolved the promise!');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Status code should indicate method not allowed');
			});
		});

		it('should reject Del', () => {
			const req = {
				uri: 'http://localhost:8080/api/boards',
				method: 'DELETE'
			};
			return request(req).then(() => {
				assert.fail('Should not have resolved the promise!');
			}, (err) => {
				assert.equal(err.statusCode, 405, 'Status code should indicate method not allowed');
			});
		});
	});

	describe('/api/board', () => {
		it('should return a board on GET', () => {
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

			const req = {
				uri: 'http://localhost:8080/api/board/1',
				method: 'GET',
				json: true,
				'resolveWithFullResponse': true
			};
			return request(req).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
				assert.deepEqual(response.body, expected, 'Body should contain data');
			});
		});

		it('should not return an invalid board', () => {
			const req = {
				uri: 'http://localhost:8080/api/board/1111',
				method: 'GET',
				json: true,
				'resolveWithFullResponse': true
			};
			return request(req).catch((response) => {
				assert.equal(response.statusCode, 404, 'Status code should be 404 OK');
			});
		});

		it('should update a board on PUT', () => {
			sandbox.stub(dao, 'updateBoard').resolves();

			const formData = {
				Title: 'test board edited!',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			};

			const req = {
				uri: 'http://localhost:8080/api/board/1111',
				method: 'PUT',
				body: formData,
				json: true,
				'resolveWithFullResponse': true
			};

			return request(req).then((response) => {
				assert.equal(response.statusCode, 200, 'Status code should be 200 OK');
			});
		});

		it('should fail to update a nonexistant board on PUT', () => {
			const formData = {
				Title: 'test board edited!',
				Adult: false,
				BoardMasters: null,
				Tags: [],
				IC: null
			};

			const req = {
				uri: 'http://localhost:8080/api/board/1111',
				method: 'PUT',
				body: formData,
				json: true,
				'resolveWithFullResponse': true
			};

			return request(req).then(() => {
				assert.fail('Request should not resolve');
			}, (response) => {
				assert.equal(response.statusCode, 404, 'Status code should be 404 NOT FOUND');
			});
		});

		it('should reject Patch', () => {
			return request({
				uri: 'http://localhost:8080/api/board/1111',
				method: 'PATCH'
			}).then(() => {
				assert.fail('Request should not resolve!');
			}, (response) => {
				assert.equal(response.statusCode, 405, 'Should reject with a 405 status code');
			});
		});

		it('should reject Post', () => {
			return request({
				uri: 'http://localhost:8080/api/board/1111',
				method: 'POST'
			}).then(() => {
				assert.fail('Request should not resolve!');
			}, (response) => {
				assert.equal(response.statusCode, 405, 'Should reject with a 405 status code');
			});
		});

		it('should reject Delete', () => {
			return request({
				uri: 'http://localhost:8080/api/board/1111',
				method: 'DELETE'
			}).then(() => {
				assert.fail('Request should not resolve!');
			}, (response) => {
				assert.equal(response.statusCode, 405, 'Should reject with a 405 status code');
			});
		});
	});
});
