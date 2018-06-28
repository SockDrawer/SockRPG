'use strict';

const Board = require('../model/Board');
const DB = require('./db');

/**
 * The Game table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module Game
 * @license MIT
 * @author yamikuronue
 */


class Game extends Board {
	constructor(rowData) {
		super(rowData);

		//Canonical link
		this.Canonical = `/api/games/${this.data.ID}`;
		//Game data
		if (!rowData.Game) {
			this.data.Game = {};

			this.data.Game.ID = rowData.GameID;
			this.data.Game.gameDescription = rowData.gameDescription;
			delete this.data.gameDescription;
		}
	}

	get GameID() {
		return this.data.Game.ID;
	}

	get description() {
		return this.data.Game.gameDescription;
	}

	set description(des) {
		this.data.Game.gameDescription = des;
	}

	serialize() {
		return super.serialize();
	}

	save() {
		const boardData = JSON.parse(JSON.stringify(this.data));
		boardData.Game = undefined;
		const gameData = JSON.parse(JSON.stringify(this.data.Game));

		return DB.knex.transaction((trx) => {
			return trx('Boards').where('ID', boardData.ID).update(boardData)
				.then(() => trx('Games').where('ID', gameData.ID).update(gameData));
		});
	}

	/**
	 * Get all vanilla boards in the forum.
	 *
	 * @returns {Promise} A Promise that is resolved with a list of vanilla boards
	 */
	static getAllGames() {
		return DB.knex('Boards').innerJoin('Games', 'Boards.GameID', 'Games.ID').select().map((row) => new Game(row));
	}

	/**
	 * Get all vanilla boards that belong to a parent board, or all root-level vanilla boards if no parent specified.
	 *
	 * @param {Number} [parentID] The ID of the parent board, or `null` for root-level boards
	 *
	 * @returns {Promise} A Promise that is resolved with a list of vanilla boards
	 */
	static getGames(parentID) {
		if (parentID !== 0) {
			parentID = parentID || null; //Coerce to null to prevent avoidable errors
		}

		return DB.knex('Boards')
			.leftJoin('ChildBoards', 'Boards.ID', 'ChildBoards.ChildID')
			.where('parentID', parentID)
			.select('Boards.ID', 'Owner', 'Name', 'GameID')
			.map((row) => new Game(row));
	}

	/**
	 * Get a vanilla board by ID.
	 *
	 * @param {Number} id The ID of the board requested
	 *
	 * @returns {Promise} A Promise that is resolved with the board requested
	 */
	static getGame(id) {
		return DB.knex('Boards')
			.innerJoin('Games', 'Boards.GameID', 'Games.ID')
			.where('Boards.ID', id)
			.select('Boards.ID', 'Owner', 'Name', 'Adult', 'GameID', 'gameDescription', 'Description').then((rows) => {
				if (!rows || rows.length <= 0) {
					return null;
				}

				return new Game(rows[0]);
			});
	}

	/**
	 * Add a game.
	 *
	 * @param {Object} game The game data to add
	 *
	 * @returns {Promise} A Promise that is resolved with the board added
	 */
	static addGame(game) {
		return Promise.resolve()
			.then(() => {
				if (!(game instanceof Game)) {
					if (game instanceof Board || !game.GameID && !game.Game) {
						throw new Error('Vanilla boards cannot be added using this method; please use addBoard() instead');
					}
					game = new Game(game);
				}
				if (!game.Name) {
					throw new Error('A game has no name.');
				}
				return DB.knex('Games').insert(game.data.Game).then((ids) => {
					game.data.Game.ID = ids[0];
					const board = JSON.parse(JSON.stringify(game.data));
					delete board.Game;
					board.GameID = game.GameID;
					return DB.knex('Boards').insert(board);
				});
			});
	}
}

module.exports = Game;
