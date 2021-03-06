'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
const express = require('express');

//Module to test
const Server = require('../../src/server');
const DB = require('../../src/model/db');

describe('server', () => {
	let sandbox, mockApp, mockServer, appRoutes, config;

	beforeEach(() => {
		config = {
			database: {
				engine: 'sqlite3',
				filename: 'database.sqlite'
			},
			http: {
				port: 8080
			}
		};
		sandbox = Sinon.createSandbox();
		sandbox.stub(DB, 'teardown').resolves();
		sandbox.stub(DB, 'initialise').resolves();
		sandbox.stub(DB, 'isInitialised').returns(true);
		mockApp = express();
		mockServer = {
			close: sandbox.stub().callsArg(0)
		};
		appRoutes = {};
		sandbox.stub(mockApp, 'route').callsFake((route) => {
			const obj = {};
			obj.get = sandbox.stub().returns(obj);
			obj.post = sandbox.stub().returns(obj);
			obj.put = sandbox.stub().returns(obj);
			obj.delete = sandbox.stub().returns(obj);
			obj.patch = sandbox.stub().returns(obj);
			appRoutes[route] = obj;
			return obj;
		});
		sandbox.stub(mockApp, 'use');
		sandbox.stub(mockApp, 'set');
		sandbox.stub(mockApp, 'engine');
		sandbox.stub(mockApp, 'listen').returns(mockServer);
		Server.app = mockApp;
	});
	afterEach(() => {
		DB.teardown.restore();
		DB.initialise.restore();
		DB.isInitialised.restore();
	});
	describe('stop()', () => {
		beforeEach(() => Server.setup(config, () => mockApp));
		it('should close server before closing db', () => {
			Server.server = mockServer;
			return Server.stop().then(() => {
				DB.teardown.calledAfter(mockServer.close).should.equal(true);
			});
		});
	});
	describe('start()', () => {
		it('should start listening to server', () => {
			return Server.setup(config, () => mockApp).then(() => {
				mockApp.listen.called.should.equal(true);
			});
		});
		it('should not start listening to server on db initialise error', () => {
			DB.isInitialised.returns(false);
			return Server.setup(config, () => mockApp).catch((err) => {
				err.toString().should.equal('Error: Initialization Error');
				mockApp.listen.called.should.equal(false);
			});
		});
	});
	describe('send405()', () => {
		it('should send only status 405', () => {
			const mockResponse = {};
			mockResponse.status = sandbox.stub().returns(mockResponse);
			mockResponse.end = sandbox.stub().returns(mockResponse);
			Server.send405(null, mockResponse);
			mockResponse.status.calledWith(405).should.be.true;
			mockResponse.end.called.should.be.true;
		});
	});
	describe('routes', () => {
		let mockResponse;
		beforeEach(() => Server.setup(config, () => mockApp)
			.then(() => {
				mockResponse = {};
				mockResponse.send = sandbox.stub().returns(mockResponse);
				mockResponse.status = sandbox.stub().returns(mockResponse);
				mockResponse.end = sandbox.stub().returns(mockResponse);
			}));
		it('should register `/` route', () => {
			appRoutes.should.have.any.key('/');
		});
		it('should have more than one route', () => {
			Object.keys(appRoutes).length.should.be.greaterThan(1);
		});
	});
});
