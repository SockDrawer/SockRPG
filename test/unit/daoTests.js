'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

//Module to test
const dao = require('../../src/dao.js');

//Test data
const dbConfig = {sqlite: ':memory:'};

describe('DAO', () => {
	before(() => {
	});

	beforeEach(() => {
	});

	afterEach(() => {
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

		it('should not crash on multiple teardowns', () => {
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
			return dao.getAllUsers().should.eventually.deep.equal([]);
		});

		it('should add a user', () => {
			const username = 'User1';
			return dao.addUser({
				Username: username
			}).should.eventually.contain(1);
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
			}).should.eventually.contain(2);
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
			return dao.getUser(0).should.eventually.equal(null);
		});

		it('should find an existing user by name', () => {
			const username = 'User1';
			return dao.getUserByName(username).should.eventually.contain.all({Username: username});
		});

		it('should not find a non-existant user by name', () => {
			return dao.getUserByName('User0').should.eventually.equal(null);
		});

		it('should edit an existing user', () => {
			const username = 'FirstUser';
			return dao.updateUser(1, {Username: username}).then(() => dao.getUser(1)).should.eventually.contain.all({Username: username});
		});

		it('should not edit a non-existant user', () => {
			return dao.updateUser(0, {}).should.be.rejectedWith(Error);
		});
	});

	describe('Games', () => {
		let userID;

		before(() => {
			return dao.initialise(dbConfig).then(() => {
				return dao.addUser({
					Username: 'GameTester'
				}).then((userids) => {
					userID = userids[0];
				});
			});
		});

		after(() => {
			return dao.teardown();
		});

		it('should start with no games', () => {
			return dao.getAllGames().should.eventually.deep.equal([]);
		});

		it('should add a game', () => {
			const title = 'Game1';
			return dao.addGame({
				Owner: userID,
				Name: title,
				Game: {
					gameDescription: 'A cool game'
				}
			}).should.eventually.contain(1);
		});

		it('should now have one game', () => {
			return dao.getAllGames().then((games) => {
				return games.length;
			}).should.become(1);
		});

		it('should add a second game', () => {
			const title = 'Game2';
			return dao.addGame({
				Owner: userID,
				Name: title,
				Game: {
					gameDescription: 'A nice game'
				}
			}).should.eventually.contain(2);
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
			return dao.getGame(0).should.eventually.equal(null);
		});

		it('should edit an existing game', () => {
			const title = 'FirstGame';
			return dao.updateGame(1, {Name: title, Game: {}}).then(() => dao.getGame(1)).should.eventually.contain.all({Name: title});
		});

		it('should not edit a non-existant game', () => {
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

/*	describe('Child Games', () => {
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
						Name: 'ParentGame',
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
			return dao.getGames(gameID).should.eventually.deep.equal([]);
		});

		it('should add a child game', () => {
			const title = 'ChildGame1';
			return dao.addGame({
				UserID: userID,
				BoardID: gameID,
				Name: title,
				Game: {}
			}).should.eventually.contain.all({
				ID: 2,
				UserID: userID,
				BoardID: gameID,
				Name: title,
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
				Name: title,
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
				Name: title,
				Game: {}
			}).should.be.rejectedWith(Error);
		});

		it('should not find children of a game with an ID of zero', () => {
			return dao.getGames(0).should.eventually.deep.equal([]);
		});
	});
	*/

	
/*	describe('Threads', () => {
		let userID = 1, boardID;
		const Thread = require('../../src/model/Thread');

		before(() => {
			return dao.initialise(dbConfig).then(() => {
				userID = 1;
				return dao.addUser({
					Username: 'BoardTester'
				}).then((ids) => {
					userID = ids[0];
					return dao.addBoard({
						Owner: userID,
						Name: 'test board'
					});
				}).then((ids) => boardID = ids[0]);
			});
		});

		after(() => {
			return dao.teardown();
		});
		
		it('should start with no threads', () => {
			return dao.getThreadList(boardID).should.eventually.deep.equal([]);
		});
		
		it('should add a thread', () => {
			const expected = new Thread({
				Title: 'thread',
				ID: 1
			});
			
			return dao.addThread(boardID, {
				Title: 'thread'
			}).then(() => dao.getThreadList(boardID)).should.eventually.contain(expected);
		});
	});
*/
});
