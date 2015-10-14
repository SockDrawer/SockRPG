const Chai = require('chai');
const assert = Chai.assert;
const request = require('request');

describe('Board API', function() {
	before(function() {
		//TODO: Start Server
	});

	beforeEach(function() {
		//TODO: Mock DAO with Sinon
	});

  describe('/api/boards', function () {
    it('should return a list of boards on GET', function (done) {
		const expected = {
			boards: [
				{
					ID: '1',
					Canonical: '/board/1',
					Name: 'test board',
					Adult: false,
					GameMasters: null,
					Tags: [],
					IC: null
				}
			]
		};

		request.get('http://localhost/api/boards', function (error, response, body) {
			assert.equal(200, response.statusCode, 'Status code should be 200 OK');
			assert.notOk(error, 'No error should be received');
			assert.deepEqual(expected, JSON.parse(body), 'Body should contain data');
			done();
		});
    });
	
	it('should add a board on Post', function (done) {
		const formData = {
			Name: 'test board',
			Adult: false,
			GameMasters: null,
			Tags: [],
			IC: null
		};
		
		request.post({url:'http://localhost/api/boards', formData: formData}, function (error, response, body) {
			assert.equal(200, response.statusCode, 'Status code should be 200 OK');
			assert.notOk(error, 'No error should be received');
			const data = JSON.parse(body);
			assert.property(data, 'id', 'ID was not returned');
			
			request.get('http://localhost/api/boards/' + data.id, function (err, res, bod) {
				assert.equal(200, res.statusCode, 'Status code should be 200 OK');
				assert.notOk(err, 'No error should be received');
				assert.equal(formData.Name, JSON.parse(bod).Name, 'Board should be returned');
				done();
			});
		});
    });
	
	it('should reject Patch', function (done) {
		request.patch('http://localhost/api/boards', function (error, response) {
			assert.equal(405, response.statusCode, 'Patch should not be accepted');
			done();
		});
    });
	
	it('should reject Put', function (done) {
		request.put('http://localhost/api/boards', function (error, response) {
			assert.equal(405, response.statusCode, 'Put shoult not be accepted');
			done();
		});
    });
	
	it('should reject Del', function (done) {
		request.del('http://localhost/api/boards', function (error, response) {
			assert.equal(405, response.statusCode, 'Del should not be accepted');
			done();
		});
    });
  });
  
  describe('/api/board', function () {
	it('should return a board on GET', function (done) {
		const expected = {
			ID: '1',
			Canonical: '/board/1',
			Name: 'test board',
			Adult: false,
			GameMasters: null,
			Tags: [],
			IC: null
		};

		request.get('http://localhost/api/board/1', function (error, response, body) {
			assert.equal(200, response.statusCode, 'Status code should be 200 OK');
			assert.notOk(error, 'No error should be received');
			assert.deepEqual(expected, JSON.parse(body), 'Body should contain data');
			done();
		});
    });
	
	it('should not return an invalid board', function (done) {
		request.get('http://localhost/api/board/1111', function (error, response) {
			assert.equal(404, response.statusCode, 'Status code should be 404 NOT FOUND');
			done();
		});
    });
	
	it('should update a board on PUT', function (done) {
		const formData = {
			Name: 'test board edited!',
			Adult: false,
			GameMasters: null,
			Tags: [],
			IC: null
		};

		request.put({url: 'http://localhost/api/board/1', formData: formData}, function (error, response) {
			assert.equal(200, response.statusCode, 'Status code should be 200 OK');
			assert.notOk(error, 'No error should be received');
			done();
		});
    });
	
	it('should reject Patch', function (done) {
		request.patch('http://localhost/api/board/1', function (error, response) {
			assert.equal(405, response.statusCode, 'Patch should not be accepted');
			done();
		});
    });
	
	it('should reject Post', function (done) {
		request.post('http://localhost/api/board/1', function (error, response) {
			assert.equal(405, response.statusCode, 'Put shoult not be accepted');
			done();
		});
    });
	
	it('should reject Del', function (done) {
		request.del('http://localhost/api/board/1', function (error, response) {
			assert.equal(405, response.statusCode, 'Del should not be accepted');
			done();
		});
    });
  });
});
