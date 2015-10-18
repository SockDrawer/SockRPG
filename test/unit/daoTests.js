'use strict';

//Testing modules
const sinon = require('sinon'),
	chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

//Module to test
const dao = require('../../src/dao.js');

//Test data
const dbConfig = {sqlite: ':memory:'};

describe('DAO', () => {
	let sandbox;

	before(() => {
	});

	beforeEach(() => {
		sandbox = sinon.sandbox;
	});

	afterEach(() => {
		sandbox.restore();
	});

	after(() => {
	});

	describe('should export DAO management function', () => {
		const fns = ['initialise', 'teardown', 'isInitialised'];
		fns.forEach((fn) => {
			it(fn, () => expect(dao[fn]).to.be.a('function'));
		});
	});

	describe('should export user management function', () => {
		const fns = ['getAllUsers', 'getUser', 'getUserByName', 'addUser', 'updateUser'];
		fns.forEach((fn) => {
			it(fn, () => expect(dao[fn]).to.be.a('function'));
		});
	});

	describe('should export board management function', () => {
		const fns = ['getAllBoards', 'getBoards', 'getBoard', 'addBoard', 'updateBoard'];
		fns.forEach((fn) => {
			it(fn, () => expect(dao[fn]).to.be.a('function'));
		});
	});

	describe('should export game management function', () => {
		const fns = ['getAllGames', 'getGames', 'getGame', 'addGame', 'updateGame'];
		fns.forEach((fn) => {
			it(fn, () => expect(dao[fn]).to.be.a('function'));
		});
	});

	describe('Initialisation', () => {
		it('should start uninitialised', () => {
			dao.isInitialised().should.equal(false);
		});

		it('should initialise successfully', () => {
			return dao.initialise(dbConfig).then(() => {
				return dao.isInitialised();
			}).should.become(true);
		});

		it('should not crash on multiple initialisations', () => {
			return dao.initialise(dbConfig).should.eventually.be.fulfilled;
		});

		it('should be torn down successfully', () => {
			return dao.teardown().then(() => {
				return dao.isInitialised();
			}).should.become(false);
		});

		it('should crash on multiple teardowns', () => {
			return dao.teardown().should.eventually.be.fulfilled;
		});
	});

	describe('Users', () => {
		before(() => {
			return dao.initialise(dbConfig);
		});

		after(() => {
			return dao.teardown();
		});

		it('should start with no users', () => {
			return dao.getAllUsers().should.be.rejectedWith(Error);
		});

		it('should add a user', () => {
			const username = 'User1';
			return dao.addUser({
				Username: username
			}).should.eventually.contain.all({
				ID: 1,
				Username: username
			});
		});

		it('should now have one user', () => {
			return dao.getAllUsers().then((users) => {
				return users.length;
			}).should.become(1);
		});

		it('should add a second user', () => {
			const username = 'User2';
			return dao.addUser({
				Username: username
			}).should.eventually.contain.all({
				ID: 2,
				Username: username
			});
		});

		it('should now have two users', () => {
			return dao.getAllUsers().then((users) => {
				return users.length;
			}).should.become(2);
		});

		it('should reject a duplicate username', () => {
			const username = 'User1';
			return dao.addUser({Username: username}).should.be.rejectedWith(Error);
		});

		it('should reject missing required fields', () => {
			return dao.addUser({}).should.be.rejected;
		});

		it('should find an existing user by ID', () => {
			return dao.getUser(1).should.eventually.contain.all({ID: 1});
		});

		it('should not find a non-existant user by ID', () => {
			return dao.getUser(0).should.be.rejectedWith(Error);
		});

		it('should find an existing user by name', () => {
			const username = 'User1';
			return dao.getUserByName(username).should.eventually.contain.all({Username: username});
		});

		it('should not find a non-existant user by name', () => {
			return dao.getUserByName('User0').should.be.rejectedWith(Error);
		});

		it('should edit an existing user', () => {
			const username = 'FirstUser';
			return dao.updateUser(1, {Username: username}).should.eventually.contain.all({Username: username});
		});

		it('should not edit an non-existant user', () => {
			return dao.updateUser(0, {}).should.be.rejectedWith(Error);
		});
	});

	describe('Boards', () => {
		let userID;

		before(() => {
			return dao.initialise(dbConfig).then(() => {
				return dao.addUser({
					Username: 'BoardTester'
				}).then((user) => {
					userID = user.ID;
				});
			});
		});

		after(() => {
			return dao.teardown();
		});

		it('should start with no boards', () => {
			return dao.getAllBoards().should.be.rejectedWith(Error);
		});

		it('should add a board', () => {
			const title = 'Board1';
			return dao.addBoard({
				UserID: userID,
				Title: title
			}).should.eventually.contain.all({
				ID: 1,
				UserID: userID,
				Title: title
			}).and.not.contain.key('Game');
		});

		it('should now have one board', () => {
			return dao.getAllBoards().then((boards) => {
				return boards.length;
			}).should.become(1);
		});

		it('should add a second board', () => {
			const title = 'Board2';
			return dao.addBoard({
				UserID: userID,
				Title: title
			}).should.eventually.contain.all({
				ID: 2,
				UserID: userID,
				Title: title
			}).and.not.contain.key('Game');
		});

		it('should now have two boards', () => {
			return dao.getAllBoards().then((boards) => {
				return boards.length;
			}).should.become(2);
		});

		it('should reject missing required fields', () => {
			return dao.addBoard({}).should.be.rejectedWith(Error);
		});

		it('should find an existing board by ID', () => {
			return dao.getBoard(1).should.eventually.contain.all({ID: 1});
		});

		it('should not find a non-existant board by ID', () => {
			return dao.getBoard(0).should.be.rejectedWith(Error);
		});

		it('should edit an existing board', () => {
			const title = 'FirstBoard';
			return dao.updateBoard(1, {Title: title}).should.eventually.contain.all({Title: title});
		});

		it('should not edit an non-existant board', () => {
			return dao.updateBoard(0, {}).should.be.rejectedWith(Error);
		});

		describe('that are really Games', () => {
			it('should not add a board with a game ID', () => {
				return dao.addBoard({
					Title: 'GameByID',
					GameID: 1
				}).should.be.rejectedWith(Error);
			});

			it('should not add a board with a game object', () => {
				return dao.addBoard({
					Title: 'GameByObject',
					Game: {}
				}).should.be.rejectedWith(Error);
			});

			it('should not edit a board with a game ID', () => {
				return dao.updateBoard(1, {
					GameID: 1
				}).should.be.rejectedWith(Error);
			});

			it('should not edit a board with a game object', () => {
				return dao.updateBoard(1, {
					Game: {}
				}).should.be.rejectedWith(Error);
			});
		});
	});

	describe('Child Boards', () => {
		let userID, boardID;

		before(() => {
			return dao.initialise(dbConfig).then(() => {
				return dao.addUser({
					Username: 'ChildBoardTester'
				}).then((user) => {
					userID = user.ID;
				}).then(() => {
					return dao.addBoard({
						UserID: userID,
						Title: 'ParentBoard'
					});
				}).then((board) => {
					boardID = board.ID;
				});
			});
		});

		after(() => {
			return dao.teardown();
		});

		it('should start with one root board', () => {
			return dao.getBoards().then((boards) => {
				return boards.length;
			}).should.become(1);
		});

		it('should start with no child boards', () => {
			return dao.getBoards(boardID).should.be.rejectedWith(Error);
		});

		it('should add a child board', () => {
			const title = 'ChildBoard1';
			return dao.addBoard({
				UserID: userID,
				BoardID: boardID,
				Title: title
			}).should.eventually.contain.all({
				ID: 2,
				UserID: userID,
				BoardID: boardID,
				Title: title
			}).and.not.contain.key('Game');
		});

		it('should now have one child board', () => {
			return dao.getBoards(boardID).then((boards) => {
				return boards.length;
			}).should.become(1);
		});

		it('should add a second child board', () => {
			const title = 'ChildBoard2';
			return dao.addBoard({
				UserID: userID,
				BoardID: boardID,
				Title: title
			}).should.eventually.contain.all({
				ID: 3,
				UserID: userID,
				BoardID: boardID,
				Title: title
			}).and.not.contain.key('Game');
		});

		it('should now have two child boards', () => {
			return dao.getBoards(boardID).then((boards) => {
				return boards.length;
			}).should.become(2);
		});

		it('should not add a child board to a non-existant parent', () => {
			const title = 'ChildBoard3';
			return dao.addBoard({
				UserID: userID,
				BoardID: 0,
				Title: title
			}).should.be.rejectedWith(Error);
		});

		it('should not find children of a board with an ID of zero', () => {
			return dao.getBoards(0).should.be.rejectedWith(Error);
		});
	});

	describe('Games', () => {
		let userID;

		before(() => {
			return dao.initialise(dbConfig).then(() => {
				return dao.addUser({
					Username: 'GameTester'
				}).then((user) => {
					userID = user.ID;
				});
			});
		});

		after(() => {
			return dao.teardown();
		});

		it('should start with no games', () => {
			return dao.getAllGames().should.be.rejectedWith(Error);
		});

		it('should add a game', () => {
			const title = 'Game1';
			return dao.addGame({
				UserID: userID,
				Title: title,
				Game: {}
			}).should.eventually.contain.all({
				ID: 1,
				UserID: userID,
				Title: title,
				GameID: 1
			}).and.contain.key('Game');
		});

		it('should now have one game', () => {
			return dao.getAllGames().then((games) => {
				return games.length;
			}).should.become(1);
		});

		it('should add a second game', () => {
			const title = 'Game2';
			return dao.addGame({
				UserID: userID,
				Title: title,
				Game: {}
			}).should.eventually.contain.all({
				ID: 2,
				UserID: userID,
				Title: title,
				GameID: 2
			}).and.contain.key('Game');
		});

		it('should now have two games', () => {
			return dao.getAllGames().then((games) => {
				return games.length;
			}).should.become(2);
		});

		it('should reject missing required fields', () => {
			return dao.addGame({}).should.be.rejectedWith(Error);
		});

		it('should find an existing game by ID', () => {
			return dao.getGame(1).should.eventually.contain.all({ID: 1});
		});

		it('should not find a non-existant game by ID', () => {
			return dao.getGame(0).should.be.rejectedWith(Error);
		});

		it('should edit an existing game', () => {
			const title = 'FirstGame';
			return dao.updateGame(1, {Title: title, Game: {}}).should.eventually.contain.all({Title: title});
		});

		it('should not edit an non-existant game', () => {
			return dao.updateGame(0, {Game: {}}).should.be.rejectedWith(Error);
		});

		describe('that are really Boards', () => {
			it('should not add a game without game info', () => {
				return dao.addGame({
					Title: 'NotAGame'
				}).should.be.rejectedWith(Error);
			});

			it('should not edit a game without game info', () => {
				return dao.updateGame(1, {}).should.be.rejectedWith(Error);
			});
		});
	});

	describe('Child Games', () => {
		let userID, gameID;

		before(() => {
			return dao.initialise(dbConfig).then(() => {
				return dao.addUser({
					Username: 'ChildGameTester'
				}).then((user) => {
					userID = user.ID;
				}).then(() => {
					return dao.addGame({
						UserID: userID,
						Title: 'ParentGame',
						Game: {}
					});
				}).then((game) => {
					gameID = game.ID;
				});
			});
		});

		after(() => {
			return dao.teardown();
		});

		it('should start with one root game', () => {
			return dao.getGames().then((games) => {
				return games.length;
			}).should.become(1);
		});

		it('should start with no child games', () => {
			return dao.getGames(gameID).should.be.rejectedWith(Error);
		});

		it('should add a child game', () => {
			const title = 'ChildGame1';
			return dao.addGame({
				UserID: userID,
				BoardID: gameID,
				Title: title,
				Game: {}
			}).should.eventually.contain.all({
				ID: 2,
				UserID: userID,
				BoardID: gameID,
				Title: title,
				GameID: 2
			}).and.contain.key('Game');
		});

		it('should now have one child game', () => {
			return dao.getGames(gameID).then((games) => {
				return games.length;
			}).should.become(1);
		});

		it('should add a child game', () => {
			const title = 'ChildGame2';
			return dao.addGame({
				UserID: userID,
				BoardID: gameID,
				Title: title,
				Game: {}
			}).should.eventually.contain.all({
				ID: 3,
				UserID: userID,
				BoardID: gameID,
				Title: title,
				GameID: 3
			}).and.contain.key('Game');
		});

		it('should now have two child games', () => {
			return dao.getGames(gameID).then((games) => {
				return games.length;
			}).should.become(2);
		});

		it('should not add a child game to a non-existant parent', () => {
			const title = 'ChildGame3';
			return dao.addGame({
				UserID: userID,
				BoardID: 0,
				Title: title,
				Game: {}
			}).should.be.rejectedWith(Error);
		});

		it('should not find children of a game with an ID of zero', () => {
			return dao.getGames(0).should.be.rejectedWith(Error);
		});
	});
});
