'use strict';
/* eslint-disable func-names*/
/* eslint-disable no-invalid-this */

/**
 * Data Access Object.
 *
 * All functions that return a Promise of data will reject that Promise if no data is found.
 *
 * @module dao
 * @license MIT
 * @author yamikuronue
 */

const sqlite3 = require('sqlite3').verbose();

const Board = require('./model/Board');
const Game = require('./model/Game');
const User = require('./model/User');
const Thread = require('./model/Thread');

const async = require('async');

let db, knex;

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
	updateGame: updateGame,
	//Thread operations
	getThreadList: getThreadList,
	addThread: addThread
	
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
	
	knex = require('knex')({
		client: 'sqlite3',
		connection: {
			filename: ':memory:'
		},
	//	debug: true,
		useNullAsDefault: true
	});
	
	return knex.schema.createTableIfNotExists('Games', (table) => {
		table.increments('ID').primary();
		table.string('gameDescription');
	}).then(() => {
		return knex.schema.createTableIfNotExists('Users', (table) => {
			table.increments('ID').primary();
			table.string('Username').notNullable().unique();
		});
	}).then(() => {
		return knex.schema.createTableIfNotExists('Boards', (table) => {
			table.increments('ID').primary();
			table.integer('Owner').references('Users.ID').notNullable();
			table.integer('GameID').references('Games.ID').nullable();
			table.string('Name').notNullable();
			table.boolean('Adult').defaultTo(false);
		});
	}).then(() => {
		return knex.schema.createTableIfNotExists('ChildBoards', (table) => {
			table.increments('ID').primary();
			table.integer('ParentID').references('Boards.ID').notNullable();
			table.integer('ChildID').references('Boards.ID').notNullable();
		});
	}).then(() => {
		return knex.schema.createTableIfNotExists('Threads', (table) => {
			table.increments('ID').primary();
			table.string('Title').notNullable();
			table.integer('Board').references('Boards.ID').notNullable();
		});
	}).then(() => {
		initialised = true;
		return Promise.resolve(initialised);
	});
}

/**
 * Tears down the DAO. *The DAO must be reinitialised before it can be used again.*
 *
 * @returns {Promise} A Promise that is resolved when the DAO is torn down.
 */
function teardown() {
	knex = null;
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
	return knex('Users').select('ID', 'Username').map((row) => new User(row));
}

/**
 * Get a user by ID.
 *
 * @param {Number} id The ID of the user requested
 *
 * @returns {Promise} A Promise that is resolved with the user requested
 */
function getUser(id) {
	return knex('Users').where('ID', id).select().then((row) => {
		if (row.length <= 0 || row[0].ID === undefined) {
			return null;
		}
		return new User(row[0]);
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
	return knex('Users').where({'Username': name}).select().then((row) => {
		if (row.length <= 0 || row[0].ID === undefined) {
			return null;
		}
		return new User(row[0]);
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
	return knex('Users').insert(user);
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
	return knex('Users').where({'ID': id}).update(user);
}

/**
 * Get all vanilla boards in the forum.
 *
 * @returns {Promise} A Promise that is resolved with a list of vanilla boards
 */
function getAllBoards() {
	return knex('Boards').select().map((row) => new Board(row));
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
	
	return knex('Boards').leftJoin('ChildBoards', 'Boards.ID', 'ChildBoards.ChildID').where('parentID', parentID).select('Boards.ID', 'Owner', 'Name', 'GameID').map((row) => new Board(row));
}

/**
 * Get a vanilla board by ID.
 *
 * @param {Number} id The ID of the board requested
 *
 * @returns {Promise} A Promise that is resolved with the board requested
 */
function getBoard(id) {
	return knex('Boards').where('ID', id).select('Boards.ID', 'Owner', 'Name', 'GameID', 'Adult').then((rows) => {
		if (!rows || rows.length <= 0) {
			return null;
		}
		
		return new Board(rows[0]);
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
		if (!board.Name) {
			throw new Error('A board has no name.');
		}
	})
	.then(() => {
		return knex('Boards').insert(board);
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
		return knex('Boards').where('ID', id).update(board);
	});
}

/**
 * Get all games in the forum.
 *
 * @returns {Promise} A Promise that is resolved with a list of games
 */
function getAllGames() {
	return knex('Boards').leftJoin('Games', 'Boards.GameID', 'Games.ID').select().map((row) => new Game(row));
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
	
	return knex('Boards').leftJoin('ChildBoards', 'Boards.ID', 'ChildBoards.ChildID').where('parentID', parentID).select('Boards.ID', 'Owner', 'Name', 'GameID').map((row) => new Game(row));
}

/**
 * Get a game by ID.
 *
 * @param {Number} id The ID of the game requested
 *
 * @returns {Promise} A Promise that is resolved with the game requested
 */
function getGame(id) {
	return knex('Boards').innerJoin('Games', 'Boards.GameID', 'Games.ID').where('Games.ID', id).select('Boards.ID', 'Owner', 'Name', 'GameID').then((rows) => {
		if (!rows || rows.length <= 0) {
			return null;
		}
		
		return new Game(rows[0]);
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
		if (!game.Name) {
			throw new Error('A board has no name.');
		}
	})
	.then(() => {
		return knex('Games').insert(game.Game).then((ids) => {
			game.GameID = ids[0];
			delete game.Game;
			return knex('Boards').insert(game);
		});
	}).then(() => Promise.resolve([game.GameID]));
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
		if (game.Game && Object.keys(game.Game).length > 0) {
			return knex('Games').where('Games.ID', id).update(game.Game);
		}
		
		return Promise.resolve();
	}).then(() => {
		delete game.Game;
		return knex('Boards').where('GameID', id).update(game);
	});
}

/**
 * Get the threads in a board
 *
 * @param {Number} boardID The ID of the board to get the threads for
 *
 * @returns {Promise} A Promise that is resolved with the thread added
 */
function getThreadList(boardID) {
	return knex('Threads')
		.innerJoin('Boards', 'Threads.Board', 'Boards.ID')
		.where('Boards.ID', boardID)
		.select('Threads.Title', 'Threads.ID')
		.map((row) => new Thread(row));
}

/**
 * Add a thread to a board
 *
 * @param {Number} boardID The ID of the board to add the thread to
 * @param {Object} thread the thread data to add
 *
 * @returns {Promise} A Promise that is resolved with the ID of the thread added
 */
function addThread(boardID, thread) {
	thread.Board = boardID;
	return knex('Threads').insert(thread);
}
