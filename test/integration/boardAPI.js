'use strict';
const Chai = require('chai');
const assert = Chai.assert;
const request = require('request');

describe('Board API', () => {
	before(() => {
		//TODO: Start Server
	});

	beforeEach(() => {
		//TODO: Mock DAO with Sinon
	});

	describe('/api/boards', () => {
		it('should return a list of boards on GET', (done) => {
			const expected = {
				boards: [{
					ID: '1',
					Canonical: '/board/1',
					Name: 'test board',
					Adult: false,
					GameMasters: null,
					Tags: [],
					IC: null
				}]
			};

			request.get('http://localhost/api/boards', (error, response, body) => {
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
				GameMasters: null,
				Tags: [],
				IC: null
			};

			request.post({
				url: 'http://localhost/api/boards',
				formData: formData
			}, (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				const data = JSON.parse(body);
				assert.property(data, 'id', 'ID was not returned');

				request.get(`http://localhost/api/boards/${data.id}`, (err, res, bod) => {
					assert.equal(200, res.statusCode, 'Status code should be 200 OK');
					assert.notOk(err, 'No error should be received');
					assert.equal(formData.Name, JSON.parse(bod).Name, 'Board should be returned');
					done();
				});
			});
		});

		it('should reject Patch', (done) => {
			request.patch('http://localhost/api/boards', (error, response) => {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
				done();
			});
		});

		it('should reject Put', (done) => {
			request.put('http://localhost/api/boards', (error, response) => {
				assert.equal(405, response.statusCode, 'Put shoult not be accepted');
				done();
			});
		});

		it('should reject Del', (done) => {
			request.del('http://localhost/api/boards', (error, response) => {
				assert.equal(405, response.statusCode, 'Del should not be accepted');
				done();
			});
		});
	});

	describe('/api/board', () => {
		it('should return a board on GET', (done) => {
			const expected = {
				ID: '1',
				Canonical: '/board/1',
				Name: 'test board',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			request.get('http://localhost/api/board/1', (error, response, body) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				assert.deepEqual(expected, JSON.parse(body), 'Body should contain data');
				done();
			});
		});

		it('should not return an invalid board', (done) => {
			request.get('http://localhost/api/board/1111', (error, response) => {
				assert.equal(404, response.statusCode, 'Status code should be 404 NOT FOUND');
				done();
			});
		});

		it('should update a board on PUT', (done) => {
			const formData = {
				Name: 'test board edited!',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			};

			request.put({
				url: 'http://localhost/api/board/1',
				formData: formData
			}, (error, response) => {
				assert.equal(200, response.statusCode, 'Status code should be 200 OK');
				assert.notOk(error, 'No error should be received');
				done();
			});
		});

		it('should reject Patch', (done) => {
			request.patch('http://localhost/api/board/1', (error, response) => {
				assert.equal(405, response.statusCode, 'Patch should not be accepted');
				done();
			});
		});

		it('should reject Post', (done) => {
			request.post('http://localhost/api/board/1', (error, response) => {
				assert.equal(405, response.statusCode, 'Put shoult not be accepted');
				done();
			});
		});

		it('should reject Del', (done) => {
			request.del('http://localhost/api/board/1', (error, response) => {
				assert.equal(405, response.statusCode, 'Del should not be accepted');
				done();
			});
		});
	});
});
