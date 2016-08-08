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
	constructor (rowData) {
		this.data = rowData;
	}
	
	get ID() {
		return this.data.id;
	}
	
	get UserID() {
		return this.data.owner;
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
}

module.exports = Board;
