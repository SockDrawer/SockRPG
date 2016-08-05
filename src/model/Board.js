'use strict';

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

module.exports = Board;
