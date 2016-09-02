'use strict';

const knex = require('./db').knex;
const DB = require('./db');

/**
 * The Board table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module User
 * @license MIT
 * @author yamikuronue
 */

class Board {
	constructor (rowData) {
		this.data = rowData;
		if (rowData.BoardID) {
			this.data.id = rowData.BoardID;
		}
		
		//Type coersion
		this.data.ID = Number(this.data.ID);
		this.data.Adult = Boolean(this.data.Adult);
	}
	
	get ID() {
		return this.data.ID;
	}
	
	get Owner() {
		return this.data.Owner;
	}
	
	get Name() {
		return this.data.Name;
	}
	
	set Name(newName) {
		this.data.Name = newName;
	}
	
	serialize() {
		return this.data;
	}
	
	save() {
		return DB.knex('Boards').where('ID', this.id).update(this.serialize());
	}
	
	/**
	* Get all vanilla boards in the forum.
	*
	* @returns {Promise} A Promise that is resolved with a list of vanilla boards
	*/
	static getAllBoards() {
		return DB.knex('Boards').select().map((row) => new Board(row));
	}
	
	/**
	* Get all vanilla boards that belong to a parent board, or all root-level vanilla boards if no parent specified.
	*
	* @param {Number} [parentID] The ID of the parent board, or `null` for root-level boards
	*
	* @returns {Promise} A Promise that is resolved with a list of vanilla boards
	*/
	static getBoards(parentID) {
		if (parentID !== 0) {
			parentID = parentID || null; //Coerce to null to prevent avoidable errors
		}
		
		return DB.knex('Boards').leftJoin('ChildBoards', 'Boards.ID', 'ChildBoards.ChildID').where('parentID', parentID).select('Boards.ID', 'Owner', 'Name', 'GameID').map((row) => new Board(row));
	}
	
	/**
	* Get a vanilla board by ID.
	*
	* @param {Number} id The ID of the board requested
	*
	* @returns {Promise} A Promise that is resolved with the board requested
	*/
	static getBoard(id) {
		return DB.knex('Boards').where('ID', id).select('Boards.ID', 'Owner', 'Name', 'GameID', 'Adult').then((rows) => {
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
	static addBoard(board) {
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
			return DB.knex('Boards').insert(board);
		});
	}
	
}

module.exports = Board;
