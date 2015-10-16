'use strict';
const Path = require('path');
const Chai = require('chai');
const assert = Chai.assert;
const Sinon = require('sinon');
require('sinon-as-promised');
const api = require(Path.resolve(__dirname, '../../src/apiController.js'));
const dao = require(Path.resolve(__dirname, '../../src/dao.js'));

describe('Game API controller', () => {
	let sandbox;
	
	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox;
	});
	
	afterEach( () => {
		sandbox.restore();
	});
	
	describe('/api/games', () => {
		it('should return a list of games', (done) => {
			const data = [{
				ID: '1',
				Name: 'test game',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			},
			{
				ID: '2',
				Name: 'test game 2',
				Adult: false,
				GameMasters: null,
				Tags: [],
				IC: null
			}];
			
			sandbox.stub(dao, 'getAllGames').resolves(data);
			const mockResponse = {
				status: (code) => {
					assert.equal(500, code, 'Should return a 500 error');
					return mockResponse;
				},
				send: (response) => {
					data[0].canonical = '/game/1';
					data[1].canonical = '/game/2';
					assert.deepEqual(data, response);
					done();
					return mockResponse;
				}
			};
			
			api.getAllGames({}, mockResponse);
		});
	});
});
