'use strict';

//Testing modules
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const Session = require('../../../src/model/Session');

const sessionController = require('../../../src/controllers/sessionController.js');

describe('Session API Controller', () => {
	let sandbox, mockRequest, mockResponse;

	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
		
		mockResponse = {};
		mockResponse.status = sandbox.stub().returns(mockResponse);
		mockResponse.send = sandbox.stub().returns(mockResponse);
		mockResponse.end = sandbox.stub().returns(mockResponse);
		
		mockRequest = {body: {}};
		mockRequest.logout = sandbox.stub().returns(mockRequest);
	});

	afterEach( () => {
		sandbox.restore();
	});

	describe('GET /api/session', async () => {
		it('Should give an error when getSession fails', async () => {
			sandbox.stub(Session, 'getSession').rejects('Oops...');
			
			await sessionController.getSession(mockRequest, mockResponse);
			
			expect(Session.getSession.should.have.been.called);
			expect(mockResponse.status.should.have.been.calledWith(500));
		});
		
		it('Should call Session.getSession, serialize the resolved value, and send that.', async () => {
			// Mock the model
			const outputData = {'Fake': 'Dummy'};
			const dataObj = {};
			dataObj.serialize = sandbox.stub().returns(outputData);
			sandbox.stub(Session, 'getSession').resolves(dataObj);
			
			// Run the call
			await sessionController.getSession(mockRequest, mockResponse);
			
			// Check that the expected output is returned
			expect(Session.getSession.should.have.been.called);
			expect(dataObj.serialize.should.have.been.called);
			expect(mockResponse.send.should.have.been.calledWith(outputData));
			expect(mockResponse.status.should.have.been.calledWith(200));
		});
	});

	describe('DELETE /api/session', async () => {
		it('Delete session should call logout and status 200', async () => {
			sessionController.deleteSession(mockRequest, mockResponse);
			
			expect(mockRequest.logout.should.have.been.called);
			expect(mockResponse.status.should.have.been.calledWith(200));
		});
	});
	
	describe('PUT/POST /api/session', async () => {
		it('Post with no username should call logout and status 200', async () => {
			mockRequest.body = {
				'Username': null
			};
			
			// Required mocks
			const next = sandbox.stub();
			const outputData = {'Fake': 'Dummy'};
			const dataObj = {};
			dataObj.serialize = sandbox.stub().returns(outputData);
			sandbox.stub(Session, 'getSession').resolves(dataObj);
			
			// Call the first handler
			await sessionController.addSession[0](mockRequest, mockResponse, next);
			
			// Check that the expected output is returned
			expect(mockRequest.logout.should.have.been.called);
			expect(next.should.not.have.been.called);
		});
		
		it('Post with a username should trigger authentication', async () => {
			mockRequest.body = {
				'Username': 'testUser',
				'Password': 'testPassword'
			};
			
			// Required mocks
			const next = sandbox.stub();
			const outputData = {'Fake': 'Dummy'};
			const dataObj = {};
			dataObj.serialize = sandbox.stub().returns(outputData);
			sandbox.stub(Session, 'getSession').resolves(dataObj);
			
			// Call the first handler
			await sessionController.addSession[0](mockRequest, mockResponse, next);
			
			// Check that the expected output is returned
			expect(next.should.have.been.called);
			expect(mockRequest.body.username.should.equal('testUser'));
			expect(mockRequest.body.password.should.equal('testPassword'));
		});
	});
	
});
