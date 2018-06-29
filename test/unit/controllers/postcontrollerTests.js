'use strict';
const Chai = require('chai');
Chai.should();

const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const postController = require('../../../src/controllers/postController.js');

const Thread = require('../../../src/model/Thread');
const Post = require('../../../src/model/Post');

describe('Post API Controller', () => {
	let sandbox, mockRequest, mockResponse;


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


	describe('GET /threads/{ID}/posts', () => {

		mockRequest = {
			params: {
				id: 1
			}
		};

		it('Should return 404 if no such thread', () => {
		//	sandbox.stub(Thread, 'getThread').resolves(null);
		//	return postController.getPosts(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(404));
		});

		it('Should return an empty list if the thread has no posts', () => {

		});

		it('Should return a list of posts if there are any', () => {

		});
	});

	describe('POST /thread/{ID}/posts', () => {

		before(() => {
			mockRequest = {
				params: {
					id: 3
				},
				body: {
					Body: 'wake up where the clouds are far behind me'
				}
			};
		});

		it('Should return 404 if no such thread', () => {
			sandbox.stub(Thread, 'getThread').resolves(null);
			return postController.addPost(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(404));
		});

		it('Should add a post', () => {
			sandbox.stub(Thread, 'getThread').resolves(new Thread({id: 3, Title: 'some thread'}));
			sandbox.stub(Post, 'addPost').resolves([10]);

			return postController.addPost(mockRequest, mockResponse).then(() => Post.addPost.should.have.been.calledWith(mockRequest.body));
		});
		it('Should add a post with no body', () => {
			mockRequest.body = undefined;
			sandbox.stub(Thread, 'getThread').resolves(new Thread({id: 3, Title: 'some thread'}));
			sandbox.stub(Post, 'addPost').resolves([10]);

			return postController.addPost(mockRequest, mockResponse)
				.then(() => Post.addPost.should.have.been.calledWith({
					Thread: 3
				}));
		});

		it('Should return 200 if a post adds successfully', () => {
			sandbox.stub(Thread, 'getThread').resolves(new Thread({id: 3, Title: 'some thread'}));
			sandbox.stub(Post, 'addPost').resolves([10]);

			return postController.addPost(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(200));
		});

		it('Should return 500 if a post rejects', () => {
			sandbox.stub(Thread, 'getThread').resolves(new Thread({id: 3, Title: 'some thread'}));
			sandbox.stub(Post, 'addPost').rejects(new Error('foobar'));

			return postController.addPost(mockRequest, mockResponse)
			.then(() => mockResponse.status.should.have.been.calledWith(500));
		});

		it('Should return ID of added post', () => {
			sandbox.stub(Thread, 'getThread').resolves(new Thread({id: 3, Title: 'some thread'}));
			sandbox.stub(Post, 'addPost').resolves([10]);
			const expected = {
				id: 10
			};

			return postController.addPost(mockRequest, mockResponse).then(() => mockResponse.send.should.have.been.calledWith(expected));
		});
	});

	describe('GET /posts/{ID}', () => {
		before(() => {
			mockRequest = {
				params: {
					id: 100
				}
			};
		});

		it('Should return 404 if no such post', () => {
			sandbox.stub(Post, 'getPostByID').resolves(null);
			return postController.getPost(mockRequest, mockResponse).then(() => mockResponse.status.should.have.been.calledWith(404));
		});

		it('Should return posts if they exist', () => {
			let postData = {
				ID: 1,
				Body: 'Somewhere over the rainbow?'
			};

			const post = new Post(postData);
			postData = post.serialize(); //add derived attributes

			sandbox.stub(Post, 'getPostByID').resolves(post);



			return postController.getPost(mockRequest, mockResponse).then(() => {
				Post.getPostByID.should.have.been.calledWith(100);

				mockResponse.status.should.have.been.calledWith(200);
				mockResponse.send.should.have.been.calledWith(postData);
			});
		});
	});
});
