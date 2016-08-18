'use strict';
const Path = require('path');
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
require('sinon-as-promised');


const page = require(Path.resolve(__dirname, '../../../src/controllers/pageController.js'));
const dao = require(Path.resolve(__dirname, '../../../src/dao.js'));

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
			sandbox.stub(dao, 'getAllBoards').resolves();
			sandbox.stub(dao, 'getAllGames').resolves();
			
			const fakeRes = {
				render: sandbox.stub()
			};
			
			const fakeReq = {};
			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
			});
		});
		
		it('should render a list of boards', () => {
			const fakeRes = {
				render: sandbox.stub()
			};
			
			const boardList = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				Tags: [],
				IC: null
			}, {
				ID: '2',
				Name: 'test board 2',
				Adult: false,
				Tags: [],
				IC: null
			}];
			
			const fakeReq = {};
			
			sandbox.stub(dao, 'getAllBoards').resolves(boardList);
			sandbox.stub(dao, 'getAllGames').resolves();

			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(dao.getAllBoards.called).to.be.equal(true);
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
				const data = fakeRes.render.args[0][1];
				expect(data.boards).to.equal(boardList);
			});
		});
		
		it('should render a list of games', () => {
			const fakeRes = {
				render: sandbox.stub()
			};
			
			const gameList = [{
				ID: '1',
				Name: 'test board',
				Adult: false,
				Tags: [],
				IC: null
			}, {
				ID: '2',
				Name: 'test board 2',
				Adult: false,
				Tags: [],
				IC: null
			}];
			
			const fakeReq = {};
			
			sandbox.stub(dao, 'getAllBoards').resolves();
			sandbox.stub(dao, 'getAllGames').resolves(gameList);

			return page.getHomePage(fakeReq, fakeRes).then(() => {
				expect(dao.getAllGames.called).to.be.equal(true);
				expect(fakeRes.render.calledWith('home')).to.be.equal(true);
				const data = fakeRes.render.args[0][1];
				expect(data.games).to.equal(gameList);
			});
		});
	});
});
