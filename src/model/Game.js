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
	construtor(rowData) {
		this.data = rowData;
	}
	get Name() {
		return this.data.Title;
	}
	set Name(newName) {
		this.data.Name = newName;
	}
	
	serialize() {
		return this.data;
	}
}

module.exports = Game;
