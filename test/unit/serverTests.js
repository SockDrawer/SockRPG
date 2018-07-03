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
	let sandbox, mockApp, mockServer, appRoutes;

	beforeEach(() => {
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
		it('should close server before closing db', () => {
			Server.server = mockServer;
			return Server.stop().then(() => {
				DB.teardown.calledAfter(mockServer.close).should.equal(true);
			});
		});
	});
	describe('start()', () => {
		it('should start listening to server', () => {
			return Server.setup().then(() => {
				mockApp.listen.called.should.equal(true);
			});
		});
	});
});
