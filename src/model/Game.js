'use strict';

const Board = require('../model/Board');
const DB = require('./db');

/**
 * The Game table.
 *
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
		if (!rowData.Game) {
			this.data.Game = {};
		
			this.data.Game.ID = rowData.GameID;
			this.data.Game.gameDescription = rowData.gameDescription;
			delete this.data.gameDescription;
		}
		
		//Stats that are computed rather than serialized
		this.stats = {
			threadCount: 0
		};
	}
	
	get gameMaster() {
		return this.data.Owner;
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
	
	get threadCount() {
		return this.stats.threadCount;
	}
	
	set threadCount(count) {
		this.stats.threadCount = count;
	}
	
	getTags() {
		return DB.knex('Tags').innerJoin('Games', 'Tags.GameID', 'Games.ID').select('Tag').map((row) => row.Tag);
	}
	
	addTag(tag) {
		return DB.knex('Tags').insert({
			GameID: this.data.Game.ID,
			Tag: tag
		});
	}
	
	removeTag(tag) {
		return DB.knex('Tags')
			.where('GameID', this.data.Game.ID)
			.where('Tag', tag)
			.del();
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
	* Get all games in the forum.
	*
	* @returns {Promise} A Promise that is resolved with a list of games
	*/
	static getAllGames() {
		return DB.knex('Boards').innerJoin('Games', 'Boards.GameID', 'Games.ID').select().map((row) => new Board(row));
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
		let game;
		return DB.knex('Boards')
			.innerJoin('Games', 'Boards.GameID', 'Games.ID')
			.where('Boards.ID', id)
			.select('Boards.ID', 'Owner', 'Name', 'Adult', 'GameID', 'gameDescription')
			.then((rows) => {
				if (!rows || rows.length <= 0) {
					game = null;
				} else {
					game = new Game(rows[0]);
				}
			})
			.then(() => DB.knex('Threads').count('ID').where('Board', id))
			.then((rows) => {
				if (game) {
					if (rows.length > 0) {
						game.threadCount = rows[0]['count("ID")'];
					} else {
						game.threadCount = 0;
					}
				}
				
				return game;
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
