'use strict';
const Path = require('path');
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const moment = require('moment');

const sinonChai = require('sinon-chai');
Chai.use(sinonChai);


const page = require(Path.resolve(__dirname, '../../../src/controllers/pageController.js'));
const Board = require('../../../src/model/Board');
const Game = require('../../../src/model/Game');
const Thread = require('../../../src/model/Thread');
const Post = require('../../../src/model/Post');
const User = require('../../../src/model/User');

const unauthenticatedFakeReq = (tbl) => {
	tbl.csrfToken = () => 12345;
	tbl.isAuthenticated = () => false;
	if (!tbl.body) {
		tbl.body = {};
	}
	return tbl;
};

const authenticatedFakeReq = (tbl) => {
	tbl.csrfToken = () => 12345;
	tbl.isAuthenticated = () => true;
	if (!tbl.body) {
		tbl.body = {};
	}
	if (!tbl.user) {
		tbl.user = {
			ID: 1,
			Username: 'FakeUser',
			Admin: false
		};
	}
	return tbl;
};

describe('Page API controller', () => {
	let sandbox, clock;
	
	const runHandlerList = async (handlerList, req, res) => {
		for (const handler of handlerList) {
			let nextCalled = false;
			const next = () => {
				nextCalled = true;
			};
			await handler(req, res, next);
			
			if (!nextCalled) {
				break;
			}
		}
	};

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
		clock = Sinon.useFakeTimers();
	});

	afterEach( () => {
		sandbox.restore();
		clock.restore();
	});

	describe('Home page', () => {

		it('should exist', () => {
			expect(page.getHomePage).to.be.a('function');
		});

		it('should render the home template', () => {
			sandbox.stub(Board, 'getAllBoards').resolves();
			sandbox.stub(Game, 'getAllGames').resolves();

			const fakeRes = {
				render: sandbox.stub(),
				status: (num) => {
					expect(num).to.equal(200);
				}
			};

			const fakeReq = unauthenticatedFakeReq({});
			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
			});
		});

		it('should return 500 on error retrieving boards', () => {
			const errortext = new Error(`foo bared her tits to the world in ${Math.floor(Math.random() * 10000)}`);
			sandbox.stub(Board, 'getAllBoards').rejects(errortext);
			sandbox.stub(Game, 'getAllGames').resolves();

			const fakeRes = {
				render: sandbox.stub(),
				status: sandbox.stub(),
				send: sandbox.stub()
			};
			fakeRes.status.returns(fakeRes);

			const fakeReq = unauthenticatedFakeReq({});
			return page.getHomePage(fakeReq, fakeRes)
				.then(() => fakeRes.status.should.have.been.calledWith(500))
				.then(() => fakeRes.send.should.have.been.calledWith({
					error: errortext.toString()
				}));
		});

		it('should render a list of boards', () => {
			const fakeRes = {
				render: sandbox.stub(),
				status: (num) => {
					expect(num).to.equal(200);
				}
			};

			const boardList = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				Tags: [],
				IC: null,
				Canonical: '/api/boards/1'
			}, {
				ID: '2',
				Name: 'test board 2',
				Adult: false,
				Tags: [],
				IC: null,
				Canonical: '/api/boards/2'
			}];

			const fakeReq = unauthenticatedFakeReq({});

			sandbox.stub(Board, 'getAllBoards').resolves(boardList.map((board) => new Board(board)));
			sandbox.stub(Game, 'getAllGames').resolves();

			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(Board.getAllBoards.called).to.be.equal(true);
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
				const data = fakeRes.render.args[0][1];
				expect(data.boards).to.deep.equal(boardList);
			});
		});

		it('should render a list of games', () => {
			const fakeRes = {
				render: sandbox.stub(),
				status: (num) => {
					expect(num).to.equal(200);
				}
			};

			const gameList = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				Tags: [],
				IC: null,
				Canonical: '/api/games/1',
				Game: {
					ID: 1,
					gameDescription: ''
				}
			}, {
				ID: '2',
				Name: 'test board 2',
				Adult: false,
				Tags: [],
				IC: null,
				Canonical: '/api/games/2',
				Game: {
					ID: 1,
					gameDescription: ''
				}
			}];

			const fakeReq = unauthenticatedFakeReq({});

			sandbox.stub(Board, 'getAllBoards').resolves();
			sandbox.stub(Game, 'getAllGames').resolves(gameList.map((game) => new Game(game)));

			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(Game.getAllGames.called).to.be.equal(true);
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
				const data = fakeRes.render.args[0][1];
				expect(data.games).to.deep.equal(gameList);
			});
		});
		
		it('should render the home template when logged in', () => {
			sandbox.stub(Board, 'getAllBoards').resolves();
			sandbox.stub(Game, 'getAllGames').resolves();

			const fakeRes = {
				render: sandbox.stub(),
				status: (num) => {
					expect(num).to.equal(200);
				}
			};

			const fakeReq = authenticatedFakeReq({});
			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
			});
		});
	});

	describe('Board view', () => {
		let fakeRes, boardData;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			fakeRes = {
				render: sandbox.stub(),
				status: sandbox.stub(),
				send: sandbox.stub(),
				end: sandbox.stub()
			};

			boardData = {
				ID: Math.random(),
				Name: 'some board'
			};
		});

		afterEach( () => {
			sandbox.restore();
		});

		it('should exist', () => {
			expect(page.getBoardView).to.be.a('function');
		});

		it('should fetch board and threads from the api', () => {
			const board = new Board(boardData);
			sandbox.stub(Board, 'get').resolves(board);
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([]);
			sandbox.spy(board, 'serialize');

			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getBoardView(fakeReq, fakeRes).then(() => {
				expect(Board.get).to.have.been.calledWith(100);
				expect(Thread.getThreadsInBoard).to.have.been.calledWith(100);
				expect(board.serialize).to.have.been.called;
			});
		});

		it('should fetch board and threads from the api (null threads)', () => {
			const board = new Board(boardData);
			sandbox.stub(Board, 'get').resolves(board);
			sandbox.stub(Thread, 'getThreadsInBoard').resolves(null);
			sandbox.spy(board, 'serialize');

			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getBoardView(fakeReq, fakeRes).then(() => {
				expect(Board.get).to.have.been.calledWith(100);
				expect(Thread.getThreadsInBoard).to.have.been.calledWith(100);
				expect(board.serialize).to.have.been.called;
			});
		});

		it('should render the template', () => {
			const board = new Board(boardData);
			const expDate = new Date();

			const threadData = {
				Title: 'some thread',
				ID: 2942,
				PostCount: 12,
				Canonical: '/api/threads/2942'
			};

			const thread = new Thread(threadData);
			const threadStats = {
				Posts: 1,
				LastPostTime: expDate,
				LastPosterId: 1,
				LastPoster: 'Fiona'
			};

			sandbox.stub(Board, 'get').resolves(board);
			sandbox.stub(Thread, 'getThreadsInBoard').resolves([thread]);
			sandbox.stub(thread, 'getThreadStatistics').resolves(threadStats);
			sandbox.spy(board, 'serialize');

			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			const expected = {
				Name: boardData.Name,
				Adult: false,
				Canonical: `/api/boards/${boardData.ID}`,
				ID: boardData.ID,
				csrfToken: 12345,
				threads: [{
					Title: 'some thread',
					ID: 2942,
					PostCount: 12,
					Canonical: '/api/threads/2942',
					Stats: threadStats
				}]
			};

			return page.getBoardView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledWith('board');
				const actual = fakeRes.render.firstCall.args[1];
				expect(actual).to.deep.equal(expected);
			});
		});

		it('should return 404 if no board is found', () => {
			sandbox.stub(Board, 'get').resolves(undefined);
			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getBoardView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledWith(404);
			});
		});

		it('should return 500 if error is thrown', () => {
			sandbox.stub(Board, 'get').rejects('I AM ERROR');
			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getBoardView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledWith(500);
			});
		});

	});

	describe('Thread view', () => {
		let fakeRes, fakeThread;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			fakeRes = {
				render: sandbox.stub(),
				status: sandbox.stub(),
				send: sandbox.stub(),
				end: sandbox.stub()
			};

			fakeThread = {
				ID: Math.random(),
				PostCount: 1,
				Title: 'some thread'
			};
		});

		afterEach( () => {
			sandbox.restore();
		});

		it('should exist', () => {
			expect(page.getThreadView).to.be.a('function');
		});

		it('should fetch thread and posts from the api', () => {
			const threadObj = new Thread(fakeThread);
			sandbox.stub(Thread, 'getThread').resolves(threadObj);
			sandbox.stub(Post, 'getPostsInThread').resolves([]);
			sandbox.spy(threadObj, 'serialize');

			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(Thread.getThread).to.have.been.calledWith(100);
				expect(Post.getPostsInThread).to.have.been.calledWith(100);
				expect(threadObj.serialize).to.have.been.called;
			});
		});



		it('should fetch thread and posts from the api (null posts)', () => {
			const threadObj = new Thread(fakeThread);
			sandbox.stub(Thread, 'getThread').resolves(threadObj);
			sandbox.stub(Post, 'getPostsInThread').resolves(null);
			sandbox.spy(threadObj, 'serialize');

			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(Thread.getThread).to.have.been.calledWith(100);
				expect(Post.getPostsInThread).to.have.been.calledWith(100);
				expect(threadObj.serialize).to.have.been.called;
			});
		});

		it('should render the template', () => {
			const fakePost = new Post({
				Body: 'The only post in the thread',
				ID: 23,
				Canonical: '/api/posts/23',
				created_at: moment().utc().toDate()
			});

			const expected = {
				Title: fakeThread.Title,
				Canonical: `/api/threads/${fakeThread.ID}`,
				csrfToken: 12345,
				ID: fakeThread.ID,
				PostCount: 1,
				posts: [fakePost.serialize()]
			};

			sandbox.stub(Thread, 'getThread').resolves(new Thread(fakeThread));
			sandbox.stub(Post, 'getPostsInThread').resolves([fakePost]);

			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledWith('thread');
				const actual = fakeRes.render.firstCall.args[1];
				expect(actual).to.deep.equal(expected);
			});
		});

		it('should return 404 if no thread is found', () => {
			sandbox.stub(Thread, 'getThread').resolves(undefined);
			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledWith(404);
			});
		});

		it('should return 500 if an error is thrown', () => {
			sandbox.stub(Thread, 'getThread').rejects('SQL kaboom!');
			const fakeReq = unauthenticatedFakeReq({
				params: {
					id: 100
				}
			});

			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledWith(500);
			});
		});
	});
	
	describe('Login view', () => {
		let fakeRes;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			fakeRes = {
				render: sandbox.stub().returns(fakeRes),
				status: sandbox.stub().returns(fakeRes),
				send: sandbox.stub().returns(fakeRes),
				end: sandbox.stub().returns(fakeRes)
			};
		});

		afterEach( () => {
			sandbox.restore();
		});

		it('should exist', () => {
			expect(page.getLoginView).to.be.a('function');
		});

		it('should render the login page', () => {
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken'
			});

			return page.getLoginView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('login');
			});
		});

		it('should return 500 if an error is thrown', () => {
			fakeRes.render.throws('Render kaboom!');
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken'
			});

			return page.getLoginView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledOnceWith(500);
			});
		});
	});
	
	describe('Signup view', () => {
		let fakeRes;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			fakeRes = {
				render: sandbox.stub().returns(fakeRes),
				status: sandbox.stub().returns(fakeRes),
				send: sandbox.stub().returns(fakeRes),
				end: sandbox.stub().returns(fakeRes)
			};
		});

		afterEach( () => {
			sandbox.restore();
		});

		it('should exist', () => {
			expect(page.getSignupView).to.be.a('function');
		});

		it('should render the signup page', () => {
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken'
			});

			return page.getSignupView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('signup');
			});
		});

		it('should return 500 if an error is thrown', () => {
			fakeRes.render.throws('Render kaboom!');
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken'
			});

			return page.getSignupView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledOnceWith(500);
			});
		});
	});
	
	
	describe('Signup post', () => {
		let fakeRes;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			fakeRes = {
				render: sandbox.stub().returns(fakeRes),
				status: sandbox.stub().returns(fakeRes),
				send: sandbox.stub().returns(fakeRes),
				end: sandbox.stub().returns(fakeRes),
				redirect: sandbox.stub().returns(fakeRes)
			};
			sandbox.stub(User, 'addUser').resolves([0]);
			sandbox.stub(User, 'getUser').resolves({});
		});

		afterEach( () => {
			sandbox.restore();
		});

		it('should exist', () => {
			expect(page.postSignup).to.be.a('array');
			for (const handler of page.postSignup) {
				expect(handler).to.be.a('function');
			}
		});
		
		it('should render the signup page if called without valid args', () => {
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken'
			});

			return runHandlerList(page.postSignup, fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('signup');
				expect(fakeRes.redirect).to.have.not.been.called;
				expect(User.addUser).to.have.not.been.called;
			});
		});
		
		it('should create a user and redirect if successful', () => {
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken',
				body: {
					username: 'TestUser',
					password: 'FakePassword',
					passwordconfirm: 'FakePassword'
				},
				login: sandbox.stub().yields()
			});

			return runHandlerList(page.postSignup, fakeReq, fakeRes).then(() => {
				expect(User.addUser).to.have.been.calledOnce;
				expect(User.getUser).to.have.been.calledOnce;
				expect(fakeReq.login).to.have.been.calledOnce;
				expect(fakeRes.redirect).to.have.been.calledOnce;
				expect(fakeRes.render).to.have.not.been.called;
			});
		});
		
		it('should give a 500 error if User.addUser fails', () => {
			User.addUser.rejects();
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken',
				body: {
					username: 'TestUser',
					password: 'FakePassword',
					passwordconfirm: 'FakePassword'
				}
			});

			return runHandlerList(page.postSignup, fakeReq, fakeRes).then(() => {
				fakeRes.status.should.have.been.calledWith(500);
				expect(fakeRes.render).to.have.not.been.called;
				expect(fakeRes.redirect).to.have.not.been.called;
			});
		});
		
		it('should render the signup page if input validation fails', () => {
			User.addUser.rejects();
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken',
				body: {
					username: 'TestUser',
					password: 'FakePassword',
					passwordconfirm: 'WrongFakePassword'
				}
			});

			return runHandlerList(page.postSignup, fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('signup');
				expect(fakeRes.redirect).to.have.not.been.called;
				expect(User.addUser).to.have.not.been.called;
			});
		});
		
	});
	
	describe('Profile edit view', () => {
		let fakeRes, fakeUser;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			
			
			fakeUser = new User({
				ID: 5,
				Username: 'someone',
				AuthSecret: 'aToken'
			});
			sandbox.stub(fakeUser, 'save').resolves({});
			sandbox.stub(fakeUser, 'changePassword').resolves();
			
			fakeRes = {
				render: sandbox.stub().returns(fakeRes),
				redirect: sandbox.stub().returns(fakeRes),
				status: sandbox.stub().returns(fakeRes),
				send: sandbox.stub().returns(fakeRes),
				end: sandbox.stub().returns(fakeRes)
			};
		});

		afterEach( () => {
			sandbox.restore();
		});

		it('should exist', () => {
			expect(page.getProfileEdit).to.be.a('function');
		});

		it('should render the profile edit page', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken'
			});

			return page.getProfileEdit(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('profileEdit');
			});
		});
		
		it('should render the login page if not authenticated', () => {
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken'
			});

			return page.getProfileEdit(fakeReq, fakeRes).then(() => {
				expect(fakeRes.redirect).to.have.been.calledOnceWith('/login');
				expect(fakeRes.render).to.have.not.been.called;
			});
		});

		it('should return 500 if an error is thrown', () => {
			fakeRes.render.throws('Render kaboom!');
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken'
			});

			return page.getProfileEdit(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledOnceWith(500);
			});
		});
	});
	
	
	describe('Profile edit post', () => {
		let fakeRes, fakeUser;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
			
			fakeUser = new User({
				ID: 5,
				Username: 'someone',
				AuthSecret: 'aToken'
			});
			sandbox.stub(fakeUser, 'save').resolves({});
			sandbox.stub(fakeUser, 'changePassword').resolves();
			
			fakeRes = {
				render: sandbox.stub().returns(fakeRes),
				status: sandbox.stub().returns(fakeRes),
				send: sandbox.stub().returns(fakeRes),
				end: sandbox.stub().returns(fakeRes),
				redirect: sandbox.stub().returns(fakeRes)
			};
		});

		afterEach( () => {
			sandbox.restore();
		});

		it('should exist', () => {
			expect(page.postProfileEdit).to.be.a('array');
			for (const handler of page.postProfileEdit) {
				expect(handler).to.be.a('function');
			}
		});
		
		it('should render the login page if not authenticated', () => {
			const fakeReq = unauthenticatedFakeReq({
				csrfToken: () => 'fakeCsrfToken'
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => {
				expect(fakeRes.redirect).to.have.been.calledOnceWith('/login');
				expect(fakeRes.render).to.have.not.been.called;
			});
		});
		
		it('should render the profile edit page if called without valid args', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken'
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('profileEdit');
				expect(fakeRes.redirect).to.have.not.been.called;
			});
		});
		
		it('should reject if passwords do not match', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken',
				body: {
					password: 'FakePassword',
					passwordconfirm: 'WrongFakePassword'
				}
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('profileEdit');
				expect(fakeUser.save).to.have.not.been.called;
			});
		});
		
				
		it('should reject if password is too short', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken',
				body: {
					password: '123',
					passwordconfirm: '123'
				}
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledOnceWith('profileEdit');
				expect(fakeUser.save).to.have.not.been.called;
			});
		});
		
		it('should save and display the page again when changes are made', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken',
				body: {
					DisplayName: 'Some One',
					Avatar: 'https://en.gravatar.com/userimage/4129996/721dae64cc7c9a0403f2280f4b2b6e64.png'
				}
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => {
				expect(fakeUser.save).to.have.been.calledOnce;
				expect(fakeRes.render).to.have.been.calledOnceWith('profileEdit');
				expect(fakeRes.redirect).to.have.not.been.called;
			});
		});
		
		it('should change the display name', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken',
				body: {
					DisplayName: 'Some One'
				}
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => expect(fakeUser.DisplayName).to.equal('Some One'));
		});
		
		it('should change the password', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken',
				body: {
					password: 'FakePassword',
					passwordconfirm: 'FakePassword'
				}
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => {
				expect(fakeUser.changePassword).to.have.been.calledWith('FakePassword');
				expect(fakeUser.save).to.have.been.calledOnce;
				expect(fakeRes.render).to.have.been.calledOnceWith('profileEdit');
				expect(fakeRes.redirect).to.have.not.been.called;
			});
		});
		
		it('should not change the password if none provided', () => {
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken',
				body: {
					DisplayName: 'Some One'
				}
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => expect(fakeUser.changePassword).to.not.have.been.called);
		});
		
		it('should give a 500 error if User.save fails', () => {
			fakeUser.save.rejects();
			const fakeReq = authenticatedFakeReq({
				user: fakeUser,
				csrfToken: () => 'fakeCsrfToken',
				body: {
					DisplayName: 'Some One'
				}
			});

			return runHandlerList(page.postProfileEdit, fakeReq, fakeRes).then(() => {
				fakeRes.status.should.have.been.calledWith(500);
				expect(fakeRes.render).to.have.not.been.called;
				expect(fakeRes.redirect).to.have.not.been.called;
			});
		});
	});
});



