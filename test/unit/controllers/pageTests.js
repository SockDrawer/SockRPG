'use strict';
const Path = require('path');
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
require('sinon-as-promised');


const page = require(Path.resolve(__dirname, '../../../src/controllers/pageController.js'));
const Board = require('../../../src/model/Board');
const Game = require('../../../src/model/Game');

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
});
