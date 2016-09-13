'use strict';
const Chai = require('chai');
Chai.should();

const Sinon = require('sinon');
require('sinon-as-promised');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const threadController = require('../../../src/controllers/threadController.js');

const Game = require('../../../src/model/Game');
const Board = require('../../../src/model/Board');
const Thread = require('../../../src/model/Thread');

describe('Thread API Controller', () => {
	let sandbox, mockRequest, mockResponse;
	
	let mockBoard = {
		ID: 12, 
		Name: 'a board'
	};
		

	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.sandbox;
		mockResponse = {};
		mockResponse.status = sandbox.stub().returns(mockResponse);
		mockResponse.send = sandbox.stub().returns(mockResponse);
		mockResponse.end = sandbox.stub().returns(mockResponse);
	});

	afterEach( () => {
		sandbox.restore();
	});


	describe('/board/{ID}/threads', () => {

		let mockRequest = {
				params: {
					id: 1
				}
			};
		
		it('Should return 404 if no such board', () => {
		    sandbox.stub(Board, 'getBoard').resolves(null);
			return threadController.getThreadsForBoard(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(404));
		});
		
		it('Should return an empty list of the board has no threads', () => {
			sandbox.stub(Board, 'getBoard').resolves(mockBoard);
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([]);
			return threadController.getThreadsForBoard(mockRequest, mockResponse).then(() => {
			    Thread.getThreadsInBoard.should.have.been.called;
			    mockResponse.status.should.have.been.calledWith(200);
			    mockResponse.send.should.have.been.calledWith('[]');
			});
		});
		
		it('Should return a list of threads if there are any', () => {
		    const threadList  = [new Thread({ID: 1, Title: 'banana'})];
		    const expected = '[{"ID":1,"Title":"banana","Canonical":"/api/Thread/1"}]';
			sandbox.stub(Board, 'getBoard').resolves(mockBoard);
			sandbox.stub(Thread, 'getThreadsInBoard').resolves(threadList);
			return threadController.getThreadsForBoard(mockRequest, mockResponse).then(() => {
			    Thread.getThreadsInBoard.should.have.been.called;
			    mockResponse.status.should.have.been.calledWith(200);
			    mockResponse.send.should.have.been.called;
			    mockResponse.send.firstCall.args[0].should.equal(expected);
			});
		});
	});

});
