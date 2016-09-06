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
	constructor (rowData) {
		super(rowData);
		
		//Canonical link
		this.Canonical = `/api/games/${this.data.ID}`;
		
		//Game data
		this.data.Game = {};
		
		this.data.Game.ID = rowData.GameID;
		delete(this.data.gameDescription);
		this.data.Game.gameDescription = rowData.gameDescription;
	}
	
	get GameID() {
		return this.data.Game.ID;
	}
	
	serialize() {
		return super.serialize();
	}
	
	/**
	* Get all vanilla boards in the forum.
	*
	* @returns {Promise} A Promise that is resolved with a list of vanilla boards
	*/
	static getAllGames() {
		return DB.knex('Boards').innerJoin('Games', 'Board.ID').select().map((row) => new Board(row));
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
		
		return DB.knex('Boards').leftJoin('ChildBoards', 'Boards.ID', 'ChildBoards.ChildID').where('parentID', parentID).select('Boards.ID', 'Owner', 'Name', 'GameID').map((row) => new Game(row));
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
			.select('Boards.ID', 'Owner', 'Name', 'GameID', 'gameDescription').then((rows) => {
				if (!rows || rows.length <= 0) {
					return null;
				}
			
				return new Game(rows[0]);
			});
	}
	
	/**
	* Add a vanilla board.
	*
	* @param {Object} board The board to add
	*
	* @returns {Promise} A Promise that is resolved with the board added
	*/
	static addGame(game) {
		return new Promise((resolve, reject) => {
			if (!game.GameID && !game.Game) {
				reject(new Error('Vanilla boards cannot be added using this method; please use addBoard() instead'));
			} else {
				resolve();
			}
		}).then(() => {
			if (!game.Name) {
				throw new Error('A game has no name.');
			}
		})
		.then(() => {
			return DB.knex('Games').insert(game.Game).then((ids) => {
				game.GameID = ids[0];
				delete game.Game;
				return DB.knex('Boards').insert(game);
			});
		});
	}
}

module.exports = Game;
