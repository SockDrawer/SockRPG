'use strict';
const Path = require('path');
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
require('sinon-as-promised');

const sinonChai = require('sinon-chai');
Chai.use(sinonChai);


const page = require(Path.resolve(__dirname, '../../../src/controllers/pageController.js'));
const Board = require('../../../src/model/Board');
const Game = require('../../../src/model/Game');
const Thread = require('../../../src/model/Thread');
const Post = require('../../../src/model/Post');

describe('Page API controller', () => {
	let sandbox;

	beforeEach(() => {
		sandbox = Sinon.sandbox.create();
	});

	afterEach( () => {
		sandbox.restore();
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
			
			const fakeReq = {};
			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
			});
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
			
			const fakeReq = {};
			
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
			
			const fakeReq = {};
			
			sandbox.stub(Board, 'getAllBoards').resolves();
			sandbox.stub(Game, 'getAllGames').resolves(gameList.map((game) => new Game(game)));

			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(Game.getAllGames.called).to.be.equal(true);
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
				const data = fakeRes.render.args[0][1];
				expect(data.games).to.deep.equal(gameList);
			});
		});
	});
	
	describe('Thread view', () => {
		let fakeRes, fakeThread;
		
		beforeEach(() => {
			sandbox = Sinon.sandbox.create();
			fakeRes = {
				render: sandbox.stub(),
				status: sandbox.stub(),
				send: sandbox.stub(),
				end: sandbox.stub()
			};
			
			fakeThread = {
				ID: Math.random(),
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
			
			const fakeReq = {
				params: {
					id: 100
				}
			};
			
			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(Thread.getThread).to.have.been.calledWith(100);
				expect(threadObj.serialize).to.have.been.called;
			});
		});
		
		it('should render the template', () => {
			const fakePostData = {
				Body: 'The only post in the thread',
				ID: 23,
				Canonical: '/api/Posts/23'
			};
			
			const expected = {
				Title: fakeThread.Title,
				Canonical: `/api/Thread/${fakeThread.ID}`,
				ID: fakeThread.ID,
				posts: [fakePostData]
			};
			
			sandbox.stub(Thread, 'getThread').resolves(new Thread(fakeThread));
			sandbox.stub(Post, 'getPostsInThread').resolves([new Post(fakePostData)]);
			
			const fakeReq = {
				params: {
					id: 100
				}
			};
			
			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render).to.have.been.calledWith('thread');
				const actual = fakeRes.render.firstCall.args[1];
				expect(actual).to.deep.equal(expected);
			});
		});
		
		it('should return 404 if no thread is found', () => {
			sandbox.stub(Thread, 'getThread').resolves(undefined);
			const fakeReq = {
				params: {
					id: 100
				}
			};
			
			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledWith(404);
			});
		});
		
		it('should return 500 if an error is thrown', () => {
			sandbox.stub(Thread, 'getThread').rejects('SQL kaboom!');
			const fakeReq = {
				params: {
					id: 100
				}
			};
			
			return page.getThreadView(fakeReq, fakeRes).then(() => {
				expect(fakeRes.status).to.have.been.calledWith(500);
			});
		});
	});
});
