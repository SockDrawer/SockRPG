'use strict';
const Path = require('path');
const Chai = require('chai');
const Sinon = require('sinon');

const sinonChai = require('sinon-chai');
Chai.use(sinonChai);


const boardControl = require(Path.resolve(__dirname, '../../../src/controllers/boardController.js'));
const Board = require('../../../src/model/Board');
const Game = require('../../../src/model/Game');

describe('Board API controller', () => {
	let sandbox, mockResponse;

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
		mockResponse = {
			send: sandbox.stub(),
			status: sandbox.stub(),
			end: sandbox.stub()
		};
		mockResponse.send.returns(mockResponse);
		mockResponse.status.returns(mockResponse);
		mockResponse.end.returns(mockResponse);
	});

	afterEach(() => {
		sandbox.restore();
	});
	describe('vanilla Board', () => {
		describe('getAllBoards()', () => {
			it('should send board data', () => {
				const boards = [new Board({
					ID: 3
				})];
				sandbox.stub(Board, 'getAllBoards').resolves(boards);
				return boardControl.getAllBoards(null, mockResponse)
					.then(() => mockResponse.send.should.be.calledWith(boards));
			});
			it('should send 500 on error', () => {
				sandbox.stub(Board, 'getAllBoards').rejects(new Error());
				return boardControl.getAllBoards(null, mockResponse)
					.then(() => mockResponse.status.should.be.calledWith(500));
			});

			it('should send error message on error', () => {
				const error = new Error(`Zelda has a great ass. ${10 + Math.ceil(Math.random() * 5)}/10 IGN`);
				sandbox.stub(Board, 'getAllBoards').rejects(error);
				return boardControl.getAllBoards(null, mockResponse)
					.then(() => {
						mockResponse.send.firstCall.args[0].should.deep.equal({
							error: error.toString()
						});
					});
			});
		});
		describe('getBoard()', () => {
			it('should require ID parameter', () => {
				const mockRequest = {
					params: {}
				};
				return boardControl.getBoard(mockRequest, mockResponse)
					.then(() => {
						//TODO: shouldn't this a 400 series error?
						mockResponse.status.should.be.calledWith(501);
						mockResponse.send.firstCall.args[0].should.deep.equal({
							error: 'Missing ID'
						});
					});
			});

			it('should 404 for nonexistant board', () => {
				const mockRequest = {
					params: {
						id: 3
					}
				};
				sandbox.stub(Board, 'get').resolves(null);
				return boardControl.getBoard(mockRequest, mockResponse)
					.then(() => {
						mockResponse.status.should.be.calledWith(404);
					});
			});

			it('should return board', () => {
				const expected = {
					Adult: false,
					Canonical: '/api/boards/5',
					ID: 5,
					Name: 'Launching Dildos Into Space',
					threadList: [1, 2, 3]
				};
				const board = new Board({
					ID: 5,
					Name: 'Launching Dildos Into Space'
				});
				sandbox.stub(Board, 'get').resolves(board);
				sandbox.stub(board, 'getThreads').resolves([1, 2, 3]);
				const mockRequest = {
					params: {
						id: 4
					}
				};
				return boardControl.getBoard(mockRequest, mockResponse)
					.then(() => {
						mockResponse.status.should.be.calledWith(200);
						mockResponse.send.firstCall.args[0].should.deep.equal(expected);
					});
			});

			it('should handle errors', () => {
				const error = new Error('Jastra\'s Milkshake brings all the boys to her back yard');
				sandbox.stub(Board, 'get').rejects(error);
				const mockRequest = {
					params: {
						id: 4
					}
				};
				return boardControl.getBoard(mockRequest, mockResponse)
					.then(() => {
						mockResponse.status.should.be.calledWith(500);
						mockResponse.send.firstCall.args[0].should.deep.equal({
							error: error.toString()
						});
					});
			});
		});
		describe('addBoard()', () => {
			it('should add board to DB', () => {
				const expected = {
					Name: 'The Perverted Exploits of a Vixen'
				};
				sandbox.stub(Board, 'addBoard').resolves([1]);
				return boardControl.addBoard({
					body: expected
				}, mockResponse).then(() => {
					Board.addBoard.should.be.calledWith(expected);
				});
			});
			it('should return ID of added board', () => {
				const expected = Math.random();
				sandbox.stub(Board, 'addBoard').resolves([expected]);
				return boardControl.addBoard({
					body: {}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(200);
					mockResponse.send.firstCall.args[0].should.deep.equal({
						id: expected
					});
				});
			});
			it('should handle error', () => {
				const expected = new Error('I lost my favorite dildo');
				sandbox.stub(Board, 'addBoard').rejects(expected);
				return boardControl.addBoard({
					body: {}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(500);
					mockResponse.send.firstCall.args[0].should.deep.equal({
						error: expected.toString()
					});
				});
			});
		});
		describe('updateBoard()', () => {
			it('should change board Name', () => {
				const board = new Board({
					Name: 'The Perverted Exploits of a Vixen'
				});
				const expected = 'this is a brave new world';
				sandbox.stub(board, 'save').resolves();
				sandbox.stub(Board, 'get').resolves(board);
				return boardControl.updateBoard({
					body: {
						Name: expected
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					board.save.called.should.equal(true);
					board.Name.should.equal(expected);
				});
			});
			it('should change board Owner', () => {
				const board = new Board({
					Name: 'The Perverted Exploits of a Vixen'
				});
				const expected = 'this is a brave new world';
				sandbox.stub(board, 'save').resolves();
				sandbox.stub(Board, 'get').resolves(board);
				return boardControl.updateBoard({
					body: {
						Owner: expected
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					board.save.called.should.equal(true);
					board.Owner.should.equal(expected);
				});
			});
			it('should change board Adult Status', () => {
				const board = new Board({
					Name: 'The Perverted Exploits of a Vixen',
					Adult: false
				});
				const expected = true;
				sandbox.stub(board, 'save').resolves();
				sandbox.stub(Board, 'get').resolves(board);
				return boardControl.updateBoard({
					body: {
						Adult: expected
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					board.save.called.should.equal(true);
					board.Adult.should.equal(true);
				});
			});
			it('should resolve with status 200 on success', () => {
				const board = new Board({
					Name: 'bar'
				});
				sandbox.stub(board, 'save').resolves();
				sandbox.stub(Board, 'get').resolves(board);
				return boardControl.updateBoard({
					body: {
						Name: 'foo'
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(200);
				});
			});

			it('should resolve with status 404 on not found', () => {
				sandbox.stub(Board, 'get').resolves(null);
				return boardControl.updateBoard({
					body: {},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(404);
				});
			});
			it('should resolve with status 404 on not found', () => {
				const err = new Error('Hi there boys and girls!');
				sandbox.stub(Board, 'get').rejects(err);
				return boardControl.updateBoard({
					body: {},
					params: {}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(500);
				});
			});
		});
	});
	describe('Game boards', () => {
		describe('getAllGames()', () => {
			it('should send board data', () => {
				const games = [new Game({
					ID: 3
				})];
				sandbox.stub(Game, 'getAllGames').resolves(games);
				return boardControl.getAllGames(null, mockResponse)
					.then(() => mockResponse.send.should.be.calledWith(games));
			});
			it('should send 500 on error', () => {
				sandbox.stub(Game, 'getAllGames').rejects(new Error());
				return boardControl.getAllGames(null, mockResponse)
					.then(() => mockResponse.status.should.be.calledWith(500));
			});

			it('should send error message on error', () => {
				const error = new Error(`Zelda has a great ass. ${10 + Math.ceil(Math.random() * 5)}/10 IGN`);
				sandbox.stub(Game, 'getAllGames').rejects(error);
				return boardControl.getAllGames(null, mockResponse)
					.then(() => {
						mockResponse.send.firstCall.args[0].should.deep.equal({
							error: error.toString()
						});
					});
			});
		});
		describe('getGame()', () => {
			it('should require ID parameter', () => {
				const mockRequest = {
					params: {}
				};
				return boardControl.getGame(mockRequest, mockResponse)
					.then(() => {
						//TODO: shouldn't this a 400 series error?
						mockResponse.status.should.be.calledWith(501);
						mockResponse.send.firstCall.args[0].should.deep.equal({
							error: 'Missing ID'
						});
					});
			});

			it('should 404 for nonexistant game', () => {
				const mockRequest = {
					params: {
						id: 3
					}
				};
				sandbox.stub(Game, 'get').resolves(null);
				return boardControl.getGame(mockRequest, mockResponse)
					.then(() => {
						mockResponse.status.should.be.calledWith(404);
					});
			});

			it('should return game', () => {
				const expected = {
					Adult: false,
					Canonical: '/api/games/5',
					ID: 5,
					Name: 'Launching Dildos Into Space',
					threadList: [1, 2, 3],
					Game: {}
				};
				const game = new Game({
					ID: 5,
					Name: 'Launching Dildos Into Space'
				});
				sandbox.stub(Game, 'get').resolves(game);
				sandbox.stub(game, 'getThreads').resolves([1, 2, 3]);
				const mockRequest = {
					params: {
						id: 4
					}
				};
				return boardControl.getGame(mockRequest, mockResponse)
					.then(() => {
						mockResponse.status.should.be.calledWith(200);
						mockResponse.send.firstCall.args[0].should.deep.equal(expected);
					});
			});

			it('should handle errors', () => {
				const error = new Error('Jastra\'s Milkshake brings all the boys to her back yard');
				sandbox.stub(Game, 'get').rejects(error);
				const mockRequest = {
					params: {
						id: 4
					}
				};
				return boardControl.getGame(mockRequest, mockResponse)
					.then(() => {
						mockResponse.status.should.be.calledWith(500);
						mockResponse.send.firstCall.args[0].should.deep.equal({
							error: error.toString()
						});
					});
			});
		});
		describe('addGame()', () => {
			it('should add game to DB', () => {
				const expected = {
					Name: 'The Perverted Exploits of a Vixen'
				};
				sandbox.stub(Game, 'addGame').resolves([1]);
				return boardControl.addGame({
					body: expected
				}, mockResponse).then(() => {
					Game.addGame.should.be.calledWith(expected);
				});
			});
			it('should return ID of added game', () => {
				const expected = Math.random();
				sandbox.stub(Game, 'addGame').resolves([expected]);
				return boardControl.addGame({
					body: {}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(200);
					mockResponse.send.firstCall.args[0].should.deep.equal({
						id: expected
					});
				});
			});
			it('should handle error', () => {
				const expected = new Error('I lost my favorite dildo');
				sandbox.stub(Game, 'addGame').rejects(expected);
				return boardControl.addGame({
					body: {}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(500);
					mockResponse.send.firstCall.args[0].should.deep.equal({
						error: expected.toString()
					});
				});
			});
		});
		describe('updateGame()', () => {
			it('should change game Name', () => {
				const game = new Game({
					Name: 'The Perverted Exploits of a Vixen'
				});
				const expected = 'this is a brave new world';
				sandbox.stub(game, 'save').resolves();
				sandbox.stub(Game, 'get').resolves(game);
				return boardControl.updateGame({
					body: {
						Name: expected,
						Game:{}
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					game.save.called.should.equal(true);
					game.Name.should.equal(expected);
				});
			});
			it('should change game Owner', () => {
				const game = new Game({
					Name: 'The Perverted Exploits of a Vixen'
				});
				const expected = 'this is a brave new world';
				sandbox.stub(game, 'save').resolves();
				sandbox.stub(Game, 'get').resolves(game);
				return boardControl.updateGame({
					body: {
						Owner: expected,
						Game:{}
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					game.save.called.should.equal(true);
					game.Owner.should.equal(expected);
				});
			});
			it('should change game Adult Status', () => {
				const game = new Game({
					Name: 'The Perverted Exploits of a Vixen',
					Adult: false
				});
				const expected = true;
				sandbox.stub(game, 'save').resolves();
				sandbox.stub(Game, 'get').resolves(game);
				return boardControl.updateGame({
					body: {
						Adult: expected,
						Game:{}
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					game.save.called.should.equal(true);
					game.Adult.should.equal(true);
				});
			});
			it('should change game Description', () => {
				const game = new Game({
					Name: 'The Perverted Exploits of a Vixen',
					Adult: false
				});
				const expected = 'Somebody once told me the world was gonna roll me';
				sandbox.stub(game, 'save').resolves();
				sandbox.stub(Game, 'get').resolves(game);
				return boardControl.updateGame({
					body: {
						Game:{
							gameDescription: expected
						}
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					game.save.called.should.equal(true);
					game.description.should.equal(expected);
				});
			});
			it('should resolve with status 200 on success', () => {
				const game = new Game({
					Name: 'bar'
				});
				sandbox.stub(game, 'save').resolves();
				sandbox.stub(Game, 'get').resolves(game);
				return boardControl.updateGame({
					body: {
						Name: 'foo',
						Game:{}
					},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(200);
				});
			});

			it('should resolve with status 404 on not found', () => {
				sandbox.stub(Game, 'get').resolves(null);
				return boardControl.updateGame({
					body: {},
					params: {
						id: 1
					}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(404);
				});
			});
			it('should resolve with status 404 on not found', () => {
				const err = new Error('Hi there boys and girls!');
				sandbox.stub(Game, 'get').rejects(err);
				return boardControl.updateGame({
					body: {},
					params: {}
				}, mockResponse).then(() => {
					mockResponse.status.should.be.calledWith(500);
				});
			});
		});
	});
});
