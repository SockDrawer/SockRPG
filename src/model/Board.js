'use strict';

const Threads = require('./Thread');
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

		//Type coersion
		this.data.ID = Number(this.data.ID);
		this.data.Adult = Boolean(this.data.Adult);

		//Canonical link
		this.Canonical = `/api/boards/${this.data.ID}`;
	}

	get ID() {
		return this.data.ID;
	}

	get Owner() {
		return this.data.Owner;
	}

	set Owner(own) {
		this.data.Owner = own;
	}

	get Name() {
		return this.data.Name;
	}

	set Name(newName) {
		this.data.Name = newName;
	}

	get Description() {
		return this.data.Description;
	}

	set Description(desc) {
		this.data.Description = desc;
	}

	get Adult() {
		return this.data.Adult;
	}

	set Adult(adult) {
		this.data.Adult = Boolean(adult);
	}

	getThreads() {
		return Threads.getThreadsInBoard(this.ID)
			.then((threads) => threads && threads.length ? threads.map((thread) => thread.ID) : []);
	}

	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		return serial;
	}

	save() {
		return DB.knex('Boards').where('ID', this.ID).update(this.data);
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
		//TODO: How does a child board get added? is it for games? should figure this out (Accalia)
		if (parentID !== 0) {
			parentID = parentID || null; //Coerce to null to prevent avoidable errors
		}

		return DB.knex('Boards')
			.leftJoin('ChildBoards', 'Boards.ID', 'ChildBoards.ChildID')
			.where('parentID', parentID)
			.select('Boards.ID', 'Owner', 'Name', 'Description', 'GameID')
			.map((row) => new Board(row));
	}

	/**
	* Get a vanilla board by ID.
	*
	* @param {Number} id The ID of the board requested
	*
	* @returns {Promise} A Promise that is resolved with the board requested
	*/
	static getBoard(id) {
		return DB.knex('Boards')
				.where('ID', id)
				.select('Boards.ID', 'Owner', 'Name', 'Description', 'GameID', 'Adult')
				.then((rows) => {
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
		if (!(board instanceof Board)) {
			board = new Board(board);
		}

		return Promise.resolve().then(() => {
			if (board.data.GameID || board.data.Game) {
				throw new Error('Games cannot be added using this method; please use addGame() instead');
			}
			if (!board.Name) {
				throw new Error('A board has no name.');
			}
			return DB.knex('Boards').insert(board.data)
				.then((ids) => {
					board.data.ID = ids[0];
					return ids;
				});
		});
	}

}

module.exports = Board;
