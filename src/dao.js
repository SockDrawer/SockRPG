'use strict';

/**
 * Data Access Object.
 *
 * All functions that return a Promise of data will reject that Promise if no data is found.
 *
 * @module dao
 * @license MIT
 * @author RaceProUK
 */

const sqlite3 = require('sqlite3').verbose();

const Board = require('./model/Board');
const Game = require('./model/Game');

let db;

let initialised = false;

module.exports = {
	initialise: initialise,
	teardown: teardown,
	isInitialised: isInitialised,
	//User operations
	getAllUsers: getAllUsers,
	getUser: getUser,
	getUserByName: getUserByName,
	addUser: addUser,
	updateUser: updateUser,
	//Board operations
	getAllBoards: getAllBoards,
	getBoards: getBoards,
	getBoard: getBoard,
	addBoard: addBoard,
	updateBoard: updateBoard,
	//Game operations
	getAllGames: getAllGames,
	getGames: getGames,
	getGame: getGame,
	addGame: addGame,
	updateGame: updateGame
};

/**
 * Initialise the DAO. *Must be called before any other function.*
 *
 * @param {Object} config The necessary information to set up the database
 * @param {String} config.sqlite The location of the SQLite file to use; if it doesn't exist, it'll be created
 * @param {Object} config.postgres The necessary information to connect to a PostgreSQL database
 * @param {String} config.postgres.host The host running the PostGreSQL server
 * @param {String} config.postgres.name The name of the database to connect to
 * @param {String} config.postgres.username The username of the user to connect as
 * @param {String} config.postgres.password The password of the user to connect as
 *
 * @returns {Promise} A Promise that is resolved when the DAO is initialised.
 */
function initialise() {
	if (initialised) {
		return Promise.resolve();
	}
	
	db = new sqlite3.Database(':memory:');
	db.run('CREATE TABLE IF NOT EXISTS Games (id INTEGER PRIMARY KEY)');
	db.run('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY)');
	db.run('CREATE TABLE IF NOT EXISTS Boards (id INTEGER PRIMARY KEY, Owner INTEGER, GameID INTEGER, Name TEXT, FOREIGN KEY(GameID) REFERENCES Game(id)'); //no user foriegn key until we get auth sorted out
	db.run('CREATE TABLE IF NOT EXISTS ChildBoards (ParentID INTEGER, ChildID INTEGER, FOREIGN KEY(ParentID) REFERENCES Board(id), FOREIGN KEY(ChildID) REFERENCES Board(id))');
//	db.run('CREATE TABLE IF NOT EXISTS GameMasters (UserID INTEGER, GameID INTEGER, FOREIGN KEY(GameID) REFERENCES Game(id), FOREIGN KEY(UserID) REFERENCES Users(id))');
	initialised = true;
	return Promise.resolve();
}

/**
 * Tears down the DAO. *The DAO must be reinitialised before it can be used again.*
 *
 * @returns {Promise} A Promise that is resolved when the DAO is torn down.
 */
function teardown() {
	db = null;
	initialised = false;
	
	return Promise.resolve();
}

/**
 * Reports if the DAO is initialised.
 *
 * @returns {boolean} Flag indicating whether the DAO is initialised.
 */
function isInitialised() {
	return initialised;
}

/**
 * Get all users in the forum.
 *
 * @returns {Promise} A Promise that is resolved with a list of users
 */
function getAllUsers() {
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM Users', (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows); //TODO: Make a model instead of a bare object
			}
		});
	});
}

/**
 * Get a user by ID.
 *
 * @param {Number} id The ID of the user requested
 *
 * @returns {Promise} A Promise that is resolved with the user requested
 */
function getUser(id) {
	//return db.Users.findByPrimary(id);
	return Promise.reject('Not yet implemented');
}

/**
 * Get a user by name.
 *
 * @param {String} name The name of the user requested
 *
 * @returns {Promise} A Promise that is resolved with the user requested
 */
function getUserByName(name) {
	return Promise.reject('Not yet implemented');
}

/**
 * Add a user.
 *
 * @param {Object} user The user to add
 *
 * @returns {Promise} A Promise that is resolved with the user added
 */
function addUser(user) {
	return Promise.reject('Not yet implemented');
}

/**
 * Update a user.
 *
 * @param {Number} id The ID of the user to update
 * @param {Object} user The details to update the user with
 *
 * @returns {Promise} A Promise that is resolved with the user updated
 */
function updateUser(id, user) {
	return Promise.reject('Not yet implemented');
}

/**
 * Get all vanilla boards in the forum.
 *
 * @returns {Promise} A Promise that is resolved with a list of vanilla boards
 */
function getAllBoards() {
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM Boards', (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows.map((row) => {
					return new Board(row);
				}));
			}
		});
	});
}

/**
 * Get all vanilla boards that belong to a parent board, or all root-level vanilla boards if no parent specified.
 *
 * @param {Number} [parentID] The ID of the parent board, or `null` for root-level boards
 *
 * @returns {Promise} A Promise that is resolved with a list of vanilla boards
 */
function getBoards(parentID) {
	if (parentID !== 0) {
		parentID = parentID || null; //Coerce to null to prevent avoidable errors
	}
	return new Promise((resolve, reject) => {
		db.all('SELECT id, Owner, Name FROM Boards INNER JOIN ChildBoards ON Boards.id = ChildBoards.ChildID WHERE ChildBoards.parentID = ? AND GameID IS NULL', parentID, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows.map((row) => {
					return new Board(row);
				}));
			}
		});
	});
}

/**
 * Get a vanilla board by ID.
 *
 * @param {Number} id The ID of the board requested
 *
 * @returns {Promise} A Promise that is resolved with the board requested
 */
function getBoard(id) {
	return new Promise((resolve, reject) => {
		db.get('SELECT id, Owner, Name FROM Boards WHERE id = ? AND GameID IS NULL', id, (err, row) => {
			if (err) {
				reject(err);
			} else {
				resolve(new Board(row));
			}
		});
	});
}

/**
 * Add a vanilla board.
 *
 * @param {Object} board The board to add
 *
 * @returns {Promise} A Promise that is resolved with the board added
 */
function addBoard(board) {
	return new Promise((resolve, reject) => {
		if (board.GameID || board.Game) {
			reject(new Error('Games cannot be added using this method; please use addGame() instead'));
		} else {
			resolve();
		}
	}).then(() => {
		return new Promise((resolve, reject) => {
			db.run('INSERT INTO Boards (Owner, Name) VALUES (?,?)', board.Owner, board.Name, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(true);
				}
			});
		});
	});
}

/**
 * Update a vanilla board.
 *
 * @param {Number} id The ID of the board to update
 * @param {Object} board The details to update the board with
 *
 * @returns {Promise} A Promise that is resolved with the board updated
 */
function updateBoard(id, board) {
	return new Promise((resolve, reject) => {
		if (board.GameID || board.Game) {
			reject(new Error('Games cannot be updated using this method; please use updateGame() instead'));
		} else {
			resolve();
		}
	}).then(() => {
		return new Promise((resolve, reject) => {
			db.run('UPDATE Boards SET Owner=?, Name=? WHERE id=?', board.Owner, board.Name, board.id, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(true);
				}
			});
		});
	});
}

/**
 * Get all games in the forum.
 *
 * @returns {Promise} A Promise that is resolved with a list of games
 */
function getAllGames() {
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM Boards INNER JOIN Games ON Board.GameID = Games.id', (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows.map((row) => {
					return new Game(row);
				}));
			}
		});
	});
}

/**
 * Get all games that belong to a parent game, or all root-level games if no parent specified.
 *
 * @param {Number} [parentID] The ID of the parent game, or `null` for root-level games
 *
 * @returns {Promise} A Promise that is resolved with a list of games
 */
function getGames(parentID) {
	if (parentID !== 0) {
		parentID = parentID || null; //Coerce to null to prevent avoidable errors
	}
	return new Promise((resolve, reject) => {
		db.all('SELECT id, Owner, Name FROM Boards INNER JOIN ChildBoards ON Boards.id = ChildBoards.ChildID WHERE ChildBoards.parentID = ?', parentID, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows.map((row) => {
					return new Game(row);
				}));
			}
		});
	});
}

/**
 * Get a game by ID.
 *
 * @param {Number} id The ID of the game requested
 *
 * @returns {Promise} A Promise that is resolved with the game requested
 */
function getGame(id) {
	return new Promise((resolve, reject) => {
		db.get('SELECT id, Owner, Name FROM Boards INNER JOIN Games ON Boards.GameID = Games.id WHERE id = ? AND GameID IS NOT NULL', id, (err, row) => {
			if (err) {
				reject(err);
			} else {
				resolve(new Game(row));
			}
		});
	});
}

/**
 * Add a game.
 *
 * @param {Object} game The game to add
 *
 * @returns {Promise} A Promise that is resolved with the game added
 */
function addGame(game) {
	return new Promise((resolve, reject) => {
		if (!game.GameID && !game.Game) {
			reject(new Error('Vanilla boards cannot be added using this method; please use addBoard() instead'));
		} else {
			resolve();
		}
	}).then(() => {
		//TODO: this is probably wrong
		return new Promise((resolve, reject) => {
			db.run('INSERT INTO Boards (Owner, Name) VALUES (?,?)', game.Owner, game.Name, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(true);
				}
			});
		});
	});
}

/**
 * Update a game.
 *
 * @param {Number} id The ID of the game to update
 * @param {Object} game The details to update the game with
 *
 * @returns {Promise} A Promise that is resolved with the game updated
 */
function updateGame(id, game) {
	return new Promise((resolve, reject) => {
		if (!game.GameID && !game.Game) {
			reject(new Error('Vanilla boards cannot be updated using this method; please use updateBoard() instead'));
		} else {
			resolve();
		}
	}).then(() => {
		//TODO: this is probably wrong
		return new Promise((resolve, reject) => {
			db.run('UPDATE Boards SET Owner=?, Name=? WHERE id=?', game.Owner, game.Name, game.id, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(true);
				}
			});
		});
	});
}
