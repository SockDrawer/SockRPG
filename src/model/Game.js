'use strict';

/**
 * The Game table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module Game
 * @license MIT
 * @author yamikuronue
 */


class Game {
	constructor (rowData) {
		this.data = rowData;
	}
	
	get ID() {
		return this.data.id;
	}
	
	get UserID() {
		return this.data.owner;
	}
	
	get GameID() {
		return this.data.GameID;
	}
	
	get Name() {
		return this.data.Name;
	}
	
	set Name(newName) {
		this.data.Name = newName;
	}
}

module.exports = Game;
