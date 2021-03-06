'use strict';
const Chai = require('chai');
Chai.should();

const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const threadController = require('../../../src/controllers/threadController.js');

const Board = require('../../../src/model/Board');
const Thread = require('../../../src/model/Thread');
const Post = require('../../../src/model/Post');

describe('Thread API Controller', () => {
	let sandbox, mockRequest, mockResponse;

	const mockBoard = {
		ID: 12,
		Name: 'a board'
	};


	before(() => {
	});

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
		mockResponse = {};
		mockResponse.status = sandbox.stub().returns(mockResponse);
		mockResponse.send = sandbox.stub().returns(mockResponse);
		mockResponse.end = sandbox.stub().returns(mockResponse);
	});

	afterEach( () => {
		sandbox.restore();
	});


	describe('GET /board/{ID}/threads', () => {

		mockRequest = {
			params: {
				id: 1
			}
		};

		it('Should return 404 if no such board', () => {
			sandbox.stub(Board, 'get').resolves(null);
			return threadController.getThreadsForBoard(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(404));
		});

		it('Should return an empty list of the board has no threads', () => {
			sandbox.stub(Board, 'get').resolves(mockBoard);
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([]);
			return threadController.getThreadsForBoard(mockRequest, mockResponse).then(() => {
				Thread.getThreadsInBoard.should.have.been.called;
				mockResponse.status.should.have.been.calledWith(200);
				mockResponse.send.should.have.been.calledWith([]);
			});
		});

		it('Should return a list of threads if there are any', () => {
			const threadList = [new Thread({ID: 1, Title: 'banana'})];
			const expected = '[{"ID":1,"Title":"banana","Canonical":"/api/threads/1","PostCount":0}]';
			sandbox.stub(Board, 'get').resolves(mockBoard);
			sandbox.stub(Thread, 'getThreadsInBoard').resolves(threadList);
			return threadController.getThreadsForBoard(mockRequest, mockResponse).then(() => {
				Thread.getThreadsInBoard.should.have.been.called;
				mockResponse.status.should.have.been.calledWith(200);
				mockResponse.send.should.have.been.called;
				JSON.stringify(mockResponse.send.firstCall.args[0]).should.equal(expected);
			});
		});
	});

	describe('POST /board/{ID}/threads', () => {

		before(() => {
			mockRequest = {
				params: {
					id: 3
				},
				body: {
					Title: 'A thread'
				}
			};
		});

		it('Should return 404 if no such board', () => {
			sandbox.stub(Board, 'get').resolves(null);
			return threadController.addThreadToBoard(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(404));
		});

		it('Should add a thread', () => {
			sandbox.stub(Board, 'get').resolves(mockBoard);
			sandbox.stub(Thread, 'addThread').resolves([1]);
			return threadController.addThreadToBoard(mockRequest, mockResponse).then(() => {
				mockResponse.status.should.have.been.calledWith(200);
				mockResponse.send.should.have.been.called;
				JSON.stringify(mockResponse.send.firstCall.args[0]).should.equal('{"id":1}');
			});
		});
		it('Should add a thread with a missing body', () => {
			sandbox.stub(Board, 'get').resolves(mockBoard);
			sandbox.stub(Thread, 'addThread').resolves([1]);
			return threadController.addThreadToBoard({
				params: {
					id: 3
				}
			}, mockResponse).then(() => {
				mockResponse.status.should.have.been.calledWith(200);
				mockResponse.send.should.have.been.called;
				JSON.stringify(mockResponse.send.firstCall.args[0]).should.equal('{"id":1}');
			});
		});
	});

	describe('GET /thread/{ID}', () => {
		mockRequest = {
			params: {
				id: 1
			}
		};

		it('Should return 404 if no such thread', () => {
			sandbox.stub(Thread, 'getThread').resolves(null);
			return threadController.getThread(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(404));
		});

		it('Should return a thread if one exists', () => {
			const data = {ID: 1, Title: 'Spongebob Fanclub', Canonical: '/api/threads/1'};
			const expected = JSON.stringify({ID: 1, Title: 'Spongebob Fanclub', Canonical: '/api/threads/1', PostCount: 0, posts: []});

			sandbox.stub(Thread, 'getThread').resolves(new Thread(data));
			sandbox.stub(Post, 'getPostsInThread').resolves();

			return threadController.getThread(mockRequest, mockResponse).then(() => {
				mockResponse.status.should.have.been.calledWith(200);
				mockResponse.send.should.have.been.called;
				JSON.stringify(mockResponse.send.firstCall.args[0]).should.equal(expected);
			});
		});

		it('Should return posts in a thread', () => {
			const threadData = {ID: 1, Title: 'Spongebob Fanclub', Canonical: '/api/threads/1'};
			const postList = [new Post({
				ID: 1,
				Body: 'Who lives in a pineapple under the sea?'
			}),
			new Post({
				ID: 2,
				Body: 'Absorbant and yellow and pourus is he!'
			})];

			sandbox.stub(Thread, 'getThread').resolves(new Thread(threadData));
			sandbox.stub(Post, 'getPostsInThread').resolves(postList);



			return threadController.getThread(mockRequest, mockResponse).then(() => {
				Post.getPostsInThread.should.have.been.called;

				mockResponse.status.should.have.been.calledWith(200);
				mockResponse.send.should.have.been.called;
			});
		});
	});
});
