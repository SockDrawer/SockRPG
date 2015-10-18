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

const db = require('./model/db');

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
 * @returns {Promise} A Promise that is resolved when the DAO is initialised.
 */
function initialise() {
	return initialised
		? Promise.resolve()
		: db.initialise().then(() => {
			initialised = true;
		});
}

/**
 * Tears down the DAO. *The DAO must be reinitialised before it can be used again.*
 *
 * @returns {Promise} A Promise that is resolved when the DAO is torn down.
 */
function teardown() {
	return !initialised
		? Promise.resolve()
		: db.close().then(() => {
			initialised = false;
		});
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
	return db.Users.findAll().then((users) => {
		if (!users || users.length === 0) {
			throw new Error(`No users exist`);
		}
		return users;
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
	return db.Users.findByPrimary(id).then((user) => {
		if (!user) {
			throw new Error(`User with ID ${id} not found`);
		}
		return user;
	});
}

/**
 * Get a user by name.
 *
 * @param {String} name The name of the user requested
 *
 * @returns {Promise} A Promise that is resolved with the user requested
 */
function getUserByName(name) {
	return db.Users.findOne({
		where: {
			Username: name
		}
	}).then((user) => {
		if (!user) {
			throw new Error(`User with ID ${name} not found`);
		}
		return user;
	});
}

/**
 * Add a user.
 *
 * @param {Object} user The user to add
 *
 * @returns {Promise} A Promise that is resolved with the user added
 */
function addUser(user) {
	return db.Users.create(user);
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
	return db.Users.update(user, {
		where: {
			ID: id
		}
	}).then(() => {
		return getUser(id);
	});
}

/**
 * Get all vanilla boards in the forum.
 *
 * @returns {Promise} A Promise that is resolved with a list of vanilla boards
 */
function getAllBoards() {
	return db.Boards.findAll({
		where: {
			GameID: null
		}
	}).then((boards) => {
		if (!boards || boards.length === 0) {
			throw new Error(`No boards exist`);
		}
		return boards;
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
	return db.Boards.findAll({
		where: {
			BoardID: parentID,
			GameID: null
		}
	}).then((boards) => {
		if (!boards || boards.length === 0) {
			throw new Error(`No boards exist with a parent of ${parentID}`);
		}
		return boards;
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
	return db.Boards.findByPrimary(id, {
		where: {
			GameID: null
		}
	}).then((board) => {
		if (!board) {
			throw new Error(`Board with ID ${id} not found`);
		}
		return board;
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
		return db.Boards.create(board);
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
		return db.Boards.update(board, {
			where: {
				ID: id,
				GameID: null
			}
		});
	}).then(() => {
		return getBoard(id);
	});
}

/**
 * Get all games in the forum.
 *
 * @returns {Promise} A Promise that is resolved with a list of games
 */
function getAllGames() {
	return db.Boards.findAll({
		where: {
			GameID: {
				not: null
			}
		},
		include: [db.Games]
	}).then((games) => {
		if (!games || games.length === 0) {
			throw new Error(`No games exist`);
		}
		return games;
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
	return db.Boards.findAll({
		where: {
			BoardID: parentID,
			GameID: {
				not: null
			}
		},
		include: [db.Games]
	}).then((games) => {
		if (!games || games.length === 0) {
			throw new Error(`No games exist with a parent of ${parentID}`);
		}
		return games;
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
	return db.Boards.findByPrimary(id, {
		where: {
			GameID: {
				not: null
			}
		},
		include: [db.Games]
	}).then((game) => {
		if (!game) {
			throw new Error(`Game with ID ${id} not found`);
		}
		return game;
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
		return db.Boards.create(game, {
			include: [db.Games]
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
			reject(new Error('Games cannot be updated using this method; please use updateBoard() instead'));
		} else {
			resolve();
		}
	}).then(() => {
		return db.Boards.update(game, {
			where: {
				ID: id,
				GameID: {
					not: null
				}
			}
		});
	}).then(() => {
		return getGame(id);
	});
}
